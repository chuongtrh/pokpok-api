// deno-lint-ignore-file no-explicit-any
import { AddPlayerDTO, CreateGameDTO } from "../dto/game.dto.ts";
import repository from "../repositories/index.ts";
import constants from "../shared/constants.ts";
import utils from "../shared/utils.ts";
import pushNotiService from "../services/push-noti.service.ts";
import { Status } from "../../deps.ts";
export default {
  getClans: async (ctx: any) => {
    const { id } = ctx.state.user || {};

    let is_private = false;
    if (id) {
      is_private = true;
    }
    const clains = await repository.clan.getClans(is_private);
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
    const games = await repository.clan.getGames(id);
    ctx.response.body = games.sort((a, b) =>
      b.created_at.seconds - a.created_at.seconds
    );
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
      balance_chip: 0,
      total_buyin_chip: 0,
      total_cashout_chip: 0,
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
      await Promise.all(
        players.map((player) =>
          repository.clan.addPlayer(clan_id, game_id, player.id, {
            id: player.id,
            name: player.name,
            profit: 0,
            profit_chip: 0,
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

    const [clan, game] = await Promise.all([
      repository.clan.getClan(clan_id),
      repository.clan.getGame(clan_id, game_id),
    ]);

    if (game.status !== constants.GAME_STATUS.NEW) {
      ctx.throw(Status.BadRequest);
      return;
    }

    await repository.clan.updateGame(clan_id, game_id, {
      status: constants.GAME_STATUS.START,
      start_at: utils.fireStoreTimestamp(new Date()),
    });

    pushNotiService.gameStart({ clan, game });

    ctx.response.body = { game_id };
  },

  endGame: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;

    const [clan, game, players] = await Promise.all([
      repository.clan.getClan(clan_id),
      repository.clan.getGame(clan_id, game_id),
      repository.clan.getPlayers(clan_id, game_id),
    ]);

    if (game.status !== constants.GAME_STATUS.START) {
      ctx.throw(Status.BadRequest);
      return;
    }

    let balanceChip = 0;
    let totalBuyinChip = 0;
    let totalCashoutChip = 0;
    await Promise.all(
      players.map((p) => {
        const profit_chip = p.total_cashout - p.total_buyin;
        balanceChip += profit_chip;
        totalBuyinChip += p.total_buyin;
        totalCashoutChip += p.total_cashout;
        return repository.clan.updatePlayer(clan_id, game_id, p.id, {
          ...p,
          profit_chip: profit_chip,
          profit: (profit_chip) * game.rate / game.stack,
        });
      }),
    );

    await repository.clan.updateGame(clan_id, game_id, {
      status: constants.GAME_STATUS.END,
      balance_chip: balanceChip,
      total_buyin_chip: totalBuyinChip,
      total_cashout_chip: totalCashoutChip,
      end_at: utils.fireStoreTimestamp(new Date()),
    });

    pushNotiService.gameEnd({
      clan,
      game: {
        ...game,
        end_at: utils.fireStoreTimestamp(new Date()),
      },
      players,
    });

    ctx.response.body = { game_id };
  },

  actionGame: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;

    const [clan, game] = await Promise.all([
      repository.clan.getClan(clan_id),
      repository.clan.getGame(clan_id, game_id),
    ]);

    if (game.status !== constants.GAME_STATUS.START) {
      ctx.throw(Status.BadRequest);
      return;
    }

    const { player_id, value, action } = await ctx.request.body({
      type: "json",
    })
      .value;

    const player = await repository.clan.getPlayer(clan_id, game_id, player_id);

    switch (action) {
      case constants.GAME_ACTIONS.BUY_IN: {
        await repository.clan.updatePlayer(clan_id, game_id, player_id, {
          status: "in",
          total_buyin: utils.fireStoreIncrement(value * game.stack),
          profit_chip: player.total_cashout -
            (player.total_buyin + value * game.stack),
          profit:
            (player.total_cashout - player.total_buyin + value * game.stack) *
            game.rate / game.stack,
        });
        break;
      }
      case constants.GAME_ACTIONS.CASH_OUT: {
        await repository.clan.updatePlayer(clan_id, game_id, player_id, {
          status: "out",
          total_cashout: utils.fireStoreIncrement(value),
          profit_chip: player.total_cashout + value - player.total_buyin,
          profit: (player.total_cashout + value - player.total_buyin) *
            game.rate / game.stack,
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

    pushNotiService.gameLog({ clan, game, action, value, player });

    ctx.response.body = {};
  },
  getLogs: async (ctx: any) => {
    const { id: clan_id, game_id } = ctx.params;
    const logs = await repository.clan.getLogs(clan_id, game_id);
    ctx.response.body = logs;
  },
  getSummary: async (ctx: any) => {
    const { id: clan_id } = ctx.params;
    const summary = await repository.clan.getSummaryClan(clan_id);
    ctx.response.body = summary;
  },
};
