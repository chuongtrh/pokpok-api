import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import userController from "../controllers/user.controller.ts";

const userRouter = new Router();
userRouter.get("/me", userController.getMe);
export default userRouter;
