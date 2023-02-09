import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import authRouter from "./auth.route.ts";
import clanRouter from "./clan.route.ts";
import userRouter from "./user.route.ts";

import { AdminAuthenticated } from "../middleware/auth.middleware.ts";

const routers = new Router();

const ignorePaths: [string] = [
  "POST /api/auth/google/login",
];

routers.use(AdminAuthenticated(ignorePaths));

routers.use("/api/auth", authRouter.routes(), authRouter.allowedMethods());
routers.use("/api/clan", clanRouter.routes(), clanRouter.allowedMethods());
routers.use("/api/user", userRouter.routes(), userRouter.allowedMethods());

export default routers;
