// deno-lint-ignore-file
import { Status } from "../../deps.ts";

import { getProfileFromCredential } from "../shared/auth.google.ts";

import repository from "../repositories/index.ts";
import jwt from "../shared/jwt.ts";

export default {
  loginWithGoogle: async (ctx: any) => {
    const { credential } = await ctx.request.body({ type: "json" }).value;
    const { email, email_verified } = getProfileFromCredential(credential);
    if (email && email_verified) {
      const user = await repository.user.getUserByEmail(email);
      if (user && user?.is_admin) {
        const token = await jwt.sign(
          { email, is_admin: true, id: user.id },
          "30d",
        );
        ctx.response.body = { user, token };
      }
    } else {
      ctx.throw(Status.NotFound);
    }
  },
};
