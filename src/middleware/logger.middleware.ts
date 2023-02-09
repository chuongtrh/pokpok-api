// deno-lint-ignore-file
export const Logger = async (ctx: any, next: () => Promise<unknown>) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(
    `${ctx.request.method} ${ctx.request.url}- ${ctx.response.status} - ${rt}`,
  );
};
