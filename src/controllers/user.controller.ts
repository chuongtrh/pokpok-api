// deno-lint-ignore-file
import { Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import repository from "../repositories/index.ts";

export default {
  getMe: async (ctx: any) => {
    const { email } = ctx.state.user;
    if (email) {
      const user = await repository.user.getUserByEmail(email);
      if (user) {
        ctx.response.body = user;
      }
    } else {
      ctx.throw(Status.NotFound);
    }
  },
};
