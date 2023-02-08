// deno-lint-ignore-file no-explicit-any
import { AddPlayerDTO, CreateGameDTO } from "../dto/game.dto.ts";
import repository from "../repositories/index.ts";
import constants from "../shared/constants.ts";
import utils from "../shared/utils.ts";

export default {
  getClans: async (ctx: any) => {
    const clains = await repository.clan.getClans();
    ctx.response.body = clains;
  },

  createClan: async (ctx: any) => {
    const { code, name } = await ctx.request.body({ type: "json" }).value;
    const clanId = await repository.clan.createClan({
      code,
      name,
      settings: {},
    });
    ctx.response.body = { clan_id: clanId };
  },

  getClan: async (ctx: any) => {
    const { id } = ctx.params;
    const clan = await repository.clan.getClan(id);
    ctx.response.body = clan;
  },

  addMember: async (ctx: any) => {
    const { id } = ctx.params;
    const { code, name } = await ctx.request.body({ type: "json" }).value;
    const memberId = await repository.clan.addMember(id, {
      code,
      name,
      joined_at: utils.fireStoreTimestamp(new Date()),
    });
    ctx.response.body = { member_id: memberId };
  },

  getMembers: async (ctx: any) => {
    const { id } = ctx.params;
    const members = await repository.clan.getMembers(id);
    ctx.response.body = members;
  },

  getGames: async (ctx: any) => {
    const { id } = ctx.params;
    const game = await repository.clan.getGames(id);
    ctx.response.body = game;
  },

  getGame: async (ctx: any) => {
    const { id, game_id } = ctx.params;
    const games = await repository.clan.getGame(id, game_id);
    ctx.response.body = games;
  },

  createGame: async (ctx: any) => {
    const { id } = ctx.params;
    const { stack, rate, name, type, players }: CreateGameDTO = await ctx
      .request.body({
        type: "json",
      })
      .value;

    const gameId = await repository.clan.addGame(id, {
      stack,
      rate,
      name,
      type,
      status: constants.GAME_STATUS.NEW,
      created_at: utils.fireStoreTimestamp(new Date()),
    });

    if (players.length > 0) {
      await Promise.all(
        players.map((player) =>
          repository.clan.addPlayer(id, gameId, player.id, {
            id: player.id,
            name: player.name,
            profit: 0,
            total_buyin: 0,
            total_cashout: 0,
          })
        ),
      );
    }
    ctx.response.body = { game_id: gameId };
  },
  getPlayers: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;
    const players = await repository.clan.getPlayers(clan_id, game_id);
    ctx.response.body = players;
  },
  addPlayer: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;

    const { players }: AddPlayerDTO = await ctx
      .request.body({
        type: "json",
      })
      .value;

    if (players.length > 0) {
      console.log("🚀 ~ players", players);

      await Promise.all(
        players.map((player) =>
          repository.clan.addPlayer(clan_id, game_id, player.id, {
            id: player.id,
            name: player.name,
            profit: 0,
            total_buyin: 0,
            total_cashout: 0,
          })
        ),
      );
    }
    ctx.response.body = { game_id: game_id };
  },
  startGame: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;
    await repository.clan.updateGame(clan_id, game_id, {
      status: constants.GAME_STATUS.START,
      start_at: utils.fireStoreTimestamp(new Date()),
    });
    ctx.response.body = { game_id };
  },

  endGame: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;

    await repository.clan.updateGame(clan_id, game_id, {
      status: constants.GAME_STATUS.END,
      end_at: utils.fireStoreTimestamp(new Date()),
    });

    ctx.response.body = { game_id };
  },

  actionGame: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;

    const game = await repository.clan.getGame(clan_id, game_id);
    if (game.status !== constants.GAME_STATUS.START) return;

    const { player_id, value, action } = await ctx.request.body({
      type: "json",
    })
      .value;

    const player = await repository.clan.getPlayer(clan_id, game_id, player_id);

    switch (action) {
      case constants.GAME_ACTIONS.BUY_IN: {
        await repository.clan.updatePlayer(clan_id, game_id, player_id, {
          total_buyin: utils.fireStoreIncrement(value * game.stack),
        });
        break;
      }
      case constants.GAME_ACTIONS.CASH_OUT: {
        await repository.clan.updatePlayer(clan_id, game_id, player_id, {
          total_cashout: utils.fireStoreIncrement(value),
        });
        break;
      }
    }

    await repository.clan.addLogIntoGame(clan_id, game_id, {
      player_id,
      name: player.name,
      action,
      value,
      created_at: utils.fireStoreTimestamp(new Date()),
    });

    ctx.response.body = {};
  },
  getLogs: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;
    const logs = await repository.clan.getLogs(clan_id, game_id);
    ctx.response.body = logs;
  },
};
