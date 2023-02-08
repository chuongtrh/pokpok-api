import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import authController from "../controllers/auth.controller.ts";

const clanRouter = new Router();
clanRouter.post("/google/login", authController.loginWithGoogle);
export default clanRouter;
