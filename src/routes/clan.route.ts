import { Router } from "../../deps.ts";

import clanController from "../controllers/clan.controller.ts";

const clanRouter = new Router();

clanRouter.get("/", clanController.getClans);
clanRouter.post("/", clanController.createClan);
clanRouter.get("/:id", clanController.getClan);

clanRouter.post("/:id/member", clanController.addMember);
clanRouter.get("/:id/member", clanController.getMembers);
clanRouter.get("/:id/summary", clanController.getSummary);

clanRouter.get("/:id/game", clanController.getGames);
clanRouter.get("/:id/game/:game_id", clanController.getGame);
clanRouter.post("/:id/game", clanController.createGame);
clanRouter.get("/:id/game/:game_id/player", clanController.getPlayers);
clanRouter.post("/:id/game/:game_id/player", clanController.addPlayer);
clanRouter.put("/:id/game/:game_id/start", clanController.startGame);
clanRouter.put("/:id/game/:game_id/end", clanController.endGame);
clanRouter.put("/:id/game/:game_id/action", clanController.actionGame);
clanRouter.get("/:id/game/:game_id/log", clanController.getLogs);

export default clanRouter;
