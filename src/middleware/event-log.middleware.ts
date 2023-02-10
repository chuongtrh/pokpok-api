// deno-lint-ignore-file

import repositories from "../repositories/index.ts";
import utils from "../shared/utils.ts";

export const EventLog = async (ctx: any, next: () => Promise<unknown>) => {
  await next();
  if (
    ctx.request.method == "POST" ||
    ctx.request.method == "PUT" ||
    ctx.request.method == "DELETE"
  ) {
    const body = await ctx.request.body({ type: "json" }).value;
    repositories.eventLog.createLog({
      method: ctx.request.method,
      pathname: ctx.request.url.pathname,
      body,
      params: ctx.params,
      status: ctx.response.status,
      created_at: utils.fireStoreTimestamp(new Date()),
    });
  }
};
