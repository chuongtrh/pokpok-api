import "https://deno.land/std@0.175.0/dotenv/load.ts";
import config from "../src/shared/config.ts";
import telegram from "../src/shared/telegram.ts";

console.log("🚀 ~ config", config);

import jwt from "../src/shared/jwt.ts";

const data = {
  a: 1,
  b: "jwt",
};

const token = await jwt.sign(data, "7d");
console.log("🚀 ~ token", token);

const payload = await jwt.verify(token);
console.log("🚀 ~ payload", payload);

// telegram.sendMessage(
//   "bot6293048331:AAH3NtDYfBxmAgAyonBRdX49x7rFCdKKm9k",
//   "-851719353",
//   `<a href="https://stackoverflow.com/">Link</a>`,
// );

const min = Math.round(
  (1000 - 20) / 60,
);
console.log("🚀 ~ min", min);
