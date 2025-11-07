import { Router } from "express";
import { BattleController } from "../controllers/battleController";
import { authenticateUser } from "../middleware/auth";

const router = Router();

// Battle queue routes
router.post("/queue", authenticateUser, BattleController.joinQueue);
router.delete("/queue", authenticateUser, BattleController.leaveQueue);
router.get("/queue/status", BattleController.getQueueStatus);

// Battle management routes
router.post("/", authenticateUser, BattleController.createBattle);

router.post("/:id/join", authenticateUser, BattleController.joinBattle);

router.get("/:id", BattleController.getBattle);

router.get("/", authenticateUser, BattleController.getUserBattles);

router.post("/:id/submit", authenticateUser, BattleController.submitBattleCode);

router.post("/:id/finish", authenticateUser, BattleController.finishBattle);

export { router as battleRoutes };
