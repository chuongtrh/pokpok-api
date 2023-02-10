const MAX_MSG_TXT_LEN = 4096;

async function _send(bot_id: string, chat_id: string, message: string) {
  const url =
    `https://api.telegram.org/${bot_id}/sendMessage?chat_id=${chat_id}&parse_mode=html&disable_web_page_preview=true&text=${
      encodeURIComponent(
        message,
      )
    }`;
  return await fetch(url);
}

export default {
  sendMessage: (bot_id: string, chat_id: string, message: string) => {
    try {
      if (message.length < MAX_MSG_TXT_LEN) {
        return _send(bot_id, chat_id, message);
      }

      let index = 0;
      const parts = [];
      const reserveSpace = 8;
      const shortTextLength = MAX_MSG_TXT_LEN - reserveSpace;
      let shortText;

      while ((shortText = message.substr(index, shortTextLength))) {
        parts.push(shortText);
        index += shortTextLength;
      }

      if (parts.length > 30) {
        const error = new Error(
          "Paging resulted into more than the maximum number of parts allowed",
        );
        return Promise.reject(error);
      }

      return Promise.all(parts.map(function (part, i) {
        return _send(bot_id, chat_id, `[${i + 1}/${parts.length}] ${part}`);
      }));
    } catch (err) {
      console.error(`TCL: sendTeleMessage -> ${err}`);
      return Promise.resolve();
    }
  },
};
