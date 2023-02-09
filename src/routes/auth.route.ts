import { Router } from "../../deps.ts";

import authController from "../controllers/auth.controller.ts";

const clanRouter = new Router();
clanRouter.post("/google/login", authController.loginWithGoogle);
export default clanRouter;
