import { Router } from "../../deps.ts";

import userController from "../controllers/user.controller.ts";

const userRouter = new Router();
userRouter.get("/me", userController.getMe);
export default userRouter;
