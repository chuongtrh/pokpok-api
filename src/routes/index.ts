import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import authRouter from "./auth.route.ts";
import clanRouter from "./clan.route.ts";

const routers = new Router();

routers.use("/api/auth", authRouter.routes(), authRouter.allowedMethods());
routers.use("/api/clan", clanRouter.routes(), clanRouter.allowedMethods());

export default routers;
