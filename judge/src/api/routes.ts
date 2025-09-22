import { Router } from "express";
import { JudgeService } from "../core/JudgeService";
import { CodeExecutor } from "../core/CodeExecutor";
import { getQueueStats } from "../queue/worker";

export function createJudgeAPI(): Router {
    const router = Router();
    const judgeService = new JudgeService();
    const codeExecutor = new CodeExecutor();

    router.get("/health", async (req, res) => {
        try {
            const health = await judgeService.healthCheck();
            const queueStats = await getQueueStats();

            res.json({
                service: "CodeMonster Judge Service",
                healthy: health.healthy,
                details: {
                    ...health.details,
                    queue: queueStats,
                },
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            res.status(500).json({
                service: "CodeMonster Judge Service",
                healthy: false,
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            });
        }
    });

    router.get("/languages", (req, res) => {
        try {
            const languages = judgeService.getSupportedLanguages();
            res.json({
                success: true,
                data: languages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    router.get("/queue/stats", async (req, res) => {
        try {
            const stats = await getQueueStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    router.post("/execute", async (req, res) => {
        try {
            const { code, language, input, timeLimit, memoryLimit } = req.body;

            if (!code || !language) {
                return res.status(400).json({
                    success: false,
                    error: "Code and language are required",
                });
            }

            const result = await codeExecutor.executeCode(
                code,
                language,
                input,
                timeLimit,
                memoryLimit
            );

            return res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error:
                    error instanceof Error ? error.message : "Execution failed",
            });
        }
    });

    router.post("/validate", (req, res) => {
        try {
            const submission = req.body;
            const validation = judgeService.validateSubmission(submission);

            res.json({
                success: true,
                data: validation,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Validation failed",
            });
        }
    });

    return router;
}
