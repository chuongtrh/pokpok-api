import "https://deno.land/std@0.175.0/dotenv/load.ts";
import config from "../src/shared/config.ts";
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
