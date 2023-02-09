// deno-lint-ignore-file
import { Status } from "../../deps.ts";
import jwt from "../shared/jwt.ts";

export const AdminAuthenticated = (ignorePath: [string]) => {
  const routerMiddleware = async (ctx: any, next: () => Promise<unknown>) => {
    const method = ctx.request.method;
    const pattern = `${method} ${ctx.request.url.pathname}`;
    if (method === "OPTION" || ignorePath.includes(pattern)) {
      await next();
    } else {
      const authHeader = ctx.request.headers.get("Authorization");
      if (
        !authHeader || !authHeader.startsWith("Bearer ") ||
        authHeader.length <= 7
      ) {
        if (method === "GET") {
          await next();
          return;
        } else {
          ctx.throw(Status.Unauthorized, "Unauthorized");
          return;
        }
      }
      try {
        const token = authHeader.slice(7);
        const payload = await jwt.verify(token);
        const { email, is_admin, id } = payload;
        if (!is_admin) {
          ctx.throw(Status.Unauthorized, "Unauthorized");
          return;
        }
        ctx.state.user = { email, id };
      } catch (e) {
        ctx.throw(Status.Unauthorized, "Unauthorized");
        return;
      }
      await next();
    }
  };
  return routerMiddleware;
};
