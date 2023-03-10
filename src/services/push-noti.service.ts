// deno-lint-ignore-file
import telegram from "../shared/telegram.ts";
import config from "../shared/config.ts";
import constants from "../shared/constants.ts";
import dayjs from "https://deno.land/x/deno_dayjs@v0.2.2/mod.ts";
import utils from "../shared/utils.ts";

const _pushMessage = (message: string, options: any = {}) => {
  console.info("🚀 ~ _pushMessage", message);
  try {
    switch (options?.provider) {
      case constants.PROVIDERS.TELEGRAM: {
        const { chat_id } = options;
        if (chat_id) {
          telegram.sendMessage(
            config.TELEGRAM_BOT_ID,
            chat_id,
            message,
          );
        }
        break;
      }
      default: {
        console.error("Don't support provider: " + options?.provider);
      }
    }
  } catch (error) {
    console.error("🚀 ~ error", error);
  }
};

export default {
  gameStart({ clan, game }: any) {
    const { settings } = clan;
    const link =
      `${config.WEB_APP_URL}/game/?clan_id=${clan?.id}&game_id=${game?.id}`;

    const message = `
============
🎯 GAME: <b>${game?.name}</b>
🏁 Start: ${dayjs().format("YYYY-MM-DD HH:mm")}
♥️  Type: ${game?.type}
🥞 Stack: ${game?.stack}
💵 Rate: ${game?.rate}
🔗 <a href="${link}">Link</a>
`;

    _pushMessage(message, {
      provider: constants.PROVIDERS.TELEGRAM,
      chat_id: settings?.tele_chat_id,
    });
  },
  gameEnd({ clan, game, players }: any) {
    const { settings } = clan;
    const link =
      `${config.WEB_APP_URL}/game/?clan_id=${clan?.id}&game_id=${game?.id}`;

    const linkDashboard =
      `${config.WEB_APP_URL}/clan/dashboard/?clan_id=${clan?.id}`;

    let totalBuyin = 0;
    let totalCashout = 0;
    players = players.map((p: any) => {
      totalBuyin += p.total_buyin;
      totalCashout += p.total_cashout;

      return {
        ...p,
        stack: p.total_buyin / game?.stack,
      };
    });

    const message = `
============
🎯 GAME: <b>${game?.name}</b>
🔚 End: ${dayjs().format("YYYY-MM-DD HH:mm")}
⏰ Duration: ${
      Math.round(
        (game?.end_at?.seconds - game?.start_at?.seconds) / 60,
      )
    } mins
🔗 <a href="${link}">Link</a>
📊 <a href="${linkDashboard}">Link dashboard</a>

💵 Buyin: ${totalBuyin}
🏃‍♂️ Cashout: ${totalCashout}
👀 (Cashout - Buyin) = ${totalCashout - totalBuyin}
🃏 Players:
${
      players?.map((p: any) => {
        return `• <b>${p.name}</b> ${p.stack} stack, in ${p.total_buyin} - out ${p.total_cashout} = ${p.profit_chip} (<b>${
          utils.formatMoney(p.profit, settings?.currency)
        }</b>)`;
      }).join("\n")
    }
`;

    _pushMessage(message, {
      provider: constants.PROVIDERS.TELEGRAM,
      chat_id: settings?.tele_chat_id,
    });
  },
  gameLog({ clan, game, action, player, value }: any) {
    const { settings } = clan;

    let message = `
============
🎯 GAME: <b>${game?.name}</b>`;

    if (action == constants.GAME_ACTIONS.BUY_IN) {
      message = `${message}
💵 <b>${player?.name}</b> buy-in <b>${value}</b> stack`;
    } else if (action == constants.GAME_ACTIONS.CASH_OUT) {
      message = `${message}
🏃‍♂️ <b>${player?.name}</b> cash-out <b>${value}</b> chips`;
    } else {
      message = `${message} 
${action}`;
    }

    _pushMessage(message, {
      provider: constants.PROVIDERS.TELEGRAM,
      chat_id: settings?.tele_chat_id,
    });
  },
};
