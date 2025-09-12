import { Router } from "express";
import { JudgeResultController } from "../controllers/judgeResultController";

const router = Router();

// Debug middleware for judge routes
router.use((req, res, next) => {
    console.log(`🔍 Judge route hit: ${req.method} ${req.path}`);
    console.log(`🔍 Request body:`, req.body);
    next();
});

router.post("/results", JudgeResultController.handleJudgeResult);

export { router as judgeRoutes };
