import { getProfileFromCredential } from "../shared/auth.google.ts";

import repository from "../repositories/index.ts";
import constants from "../shared/constants.ts";
import utils from "../shared/utils.ts";

export default {
  loginWithGoogle: async (ctx: any) => {
    const { credential } = await ctx.request.body({ type: "json" }).value;
    const { email, email_verified } = getProfileFromCredential(credential);
    if (email && email_verified) {
      const user = await repository.user.getUserByEmail(email);
      if (user && user?.is_admin) {
        ctx.response.body = { ok: true, user };
      }
    }
    ctx.response.body = { ok: true };
  },
};
