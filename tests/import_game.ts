import "https://deno.land/std@0.175.0/dotenv/load.ts";
import config from "../src/shared/config.ts";
import repository from "../src/repositories/index.ts";

import utils from "../src/shared/utils.ts";
import constants from "../src/shared/constants.ts";

import dataImport from "./game.json" assert { type: "json" };

const clanId = "gIWHWFWASVNMpRYwXjZz";

//Setup member in Clan
async function ImportMember() {
  const memberNames = [
    "Chương",
    "Dustin",
    "Đạt",
    "Hồng",
    "Luận",
    "My",
    "Ngọc",
    "Ngôn",
    "Nhã",
    "Trang",
    "Tú",
    "Thịnh",
  ];

  for await (const name of memberNames) {
    await repository.clan.addMember(clanId, {
      name: name,
      code: utils.removeUnicodeOnly(name).toLowerCase(),
      joined_at: utils.fireStoreTimestamp(new Date()),
    });
  }
}

await ImportMember();

const members = await repository.clan.getMembers(clanId);
const memberMapping: any = {};
members.forEach((member) => {
  memberMapping[member.code] = member;
});
// console.log("🚀 ~ memberMapping", memberMapping);

const STACK = 500;
const RATE = 50000;

async function actionGame(
  {
    action,
    clan_id,
    game_id,
    player_id,
    player_name,
    stack,
    value,
    date,
  }: any,
) {
  switch (action) {
    case constants.GAME_ACTIONS.BUY_IN: {
      await repository.clan.updatePlayer(clan_id, game_id, player_id, {
        status: "in",
        total_buyin: utils.fireStoreIncrement(value * stack),
      });
      break;
    }
    case constants.GAME_ACTIONS.CASH_OUT: {
      await repository.clan.updatePlayer(clan_id, game_id, player_id, {
        status: "out",
        total_cashout: utils.fireStoreIncrement(value),
      });
      break;
    }
  }

  await repository.clan.addLogIntoGame(clan_id, game_id, {
    player_id,
    name: player_name,
    action,
    value,
    created_at: utils.fireStoreTimestamp(new Date(date)),
  });
}
//Import game in Clan
for await (const game of dataImport) {
  const { name, date, session, players } = game;

  //1. Create game
  const gameId = await repository.clan.addGame(clanId, {
    stack: STACK,
    rate: RATE,
    name,
    type: "texas_holdem",
    status: constants.GAME_STATUS.START,
    created_at: utils.fireStoreTimestamp(new Date(date)),
  });
  console.log("🚀 ~ start gameId", gameId);

  //2. Setup player
  for await (const player of players) {
    const { name, buyin_count, total_cashout } = player;

    const code = utils.removeUnicodeOnly(name).toLowerCase();
    const buyin: number = parseInt(buyin_count);
    const cashout: number = parseInt(total_cashout.replace(",", ""));

    const member = memberMapping[code];
    if (buyin > 0 && member) {
      //add player
      await repository.clan.addPlayer(clanId, gameId, member.id, {
        id: member.id,
        name: player.name,
        profit: 0,
        total_buyin: 0,
        total_cashout: 0,
      });

      //ín
      await actionGame({
        action: "buyin",
        clan_id: clanId,
        game_id: gameId,
        player_id: member.id,
        player_name: name,
        stack: STACK,
        value: buyin,
        date,
      });

      //out
      await actionGame({
        action: "cashout",
        clan_id: clanId,
        game_id: gameId,
        player_id: member.id,
        player_name: name,
        stack: STACK,
        value: cashout,
        date,
      });

      console.log("🚀 ~ player:", member.name);
    }
  }

  //3. End game
  await repository.clan.updateGame(clanId, gameId, {
    status: constants.GAME_STATUS.END,
    end_at: utils.fireStoreTimestamp(new Date(date)),
  });
  console.log("🚀 ~ end gameId", gameId);

  const playerInGame = await repository.clan.getPlayers(clanId, gameId);
  await Promise.all(
    playerInGame.map((p) =>
      repository.clan.updatePlayer(clanId, gameId, p.id, {
        ...p,
        profit_chip: p.total_cashout - p.total_buyin,
        profit: (p.total_cashout - p.total_buyin) * RATE / STACK,
      })
    ),
  );
  console.log("🚀 ~ Done gameId", gameId);
}

console.log(`🚀 ~ DONE ${dataImport.length} games`);
