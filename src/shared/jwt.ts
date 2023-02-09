// deno-lint-ignore-file
import config from "./config.ts";
import { jose } from "../../deps.ts";

const jwtSecret = new TextEncoder().encode(config.JWT_SECRET);

export default {
  sign: async (data: any, expiry: any) => {
    const jwt = await new jose.SignJWT(data)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("pokpok")
      .setExpirationTime(expiry)
      .sign(jwtSecret);

    return jwt;
  },
  verify: async (token: string) => {
    const { payload } = await jose.jwtVerify(token, jwtSecret, {
      issuer: "pokpok",
    });
    return payload;
  },
};
