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
            const { code, language, testCases, timeLimit, memoryLimit } =
                req.body;

            if (!code || !language) {
                return res.status(400).json({
                    success: false,
                    error: "Code and language are required",
                });
            }

            if (testCases && Array.isArray(testCases)) {
                console.log(
                    `🧪 Running code against ${testCases.length} test cases`
                );

                const testCaseResults = [];
                let totalRuntime = 0;
                let maxMemoryUsage = 0;
                let testCasesPassed = 0;

                for (let i = 0; i < testCases.length; i++) {
                    const testCase = testCases[i];
                    console.log(
                        `🧪 Running test case ${i + 1}/${testCases.length}`
                    );
                    console.log(`📥 Input: ${testCase.input}`);
                    console.log(`📤 Expected: ${testCase.output}`);

                    try {
                        const result = await codeExecutor.executeCode(
                            code,
                            language,
                            testCase.input,
                            timeLimit,
                            memoryLimit
                        );

                        const passed =
                            result.output?.trim() === testCase.output?.trim();
                        if (passed) testCasesPassed++;

                        const testCaseResult = {
                            input: testCase.input,
                            expectedOutput: testCase.output,
                            actualOutput: result.output || "",
                            passed,
                            runtime: result.runtime || 0,
                            memoryUsage: result.memoryUsage || 0,
                            error: result.error,
                        };

                        testCaseResults.push(testCaseResult);
                        totalRuntime += result.runtime || 0;
                        maxMemoryUsage = Math.max(
                            maxMemoryUsage,
                            result.memoryUsage || 0
                        );

                        console.log(
                            `🔍 Test case ${i + 1} result: ${
                                passed ? "✅ PASSED" : "❌ FAILED"
                            }`
                        );
                        if (!passed) {
                            console.log(`   Expected: "${testCase.output}"`);
                            console.log(`   Actual:   "${result.output}"`);
                        }

                        if (
                            result.error &&
                            (result.error.includes("compilation") ||
                                result.error.includes("runtime"))
                        ) {
                            break;
                        }
                    } catch (error) {
                        console.error(
                            `❌ Test case ${i + 1} execution failed:`,
                            error
                        );
                        testCaseResults.push({
                            input: testCase.input,
                            expectedOutput: testCase.output,
                            actualOutput: "",
                            passed: false,
                            runtime: 0,
                            memoryUsage: 0,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : "Execution failed",
                        });
                        break;
                    }
                }

                const overallStatus =
                    testCasesPassed === testCases.length
                        ? "ACCEPTED"
                        : testCaseResults.some((r) =>
                              r.error?.includes("compilation")
                          )
                        ? "COMPILATION_ERROR"
                        : testCaseResults.some((r) =>
                              r.error?.includes("runtime")
                          )
                        ? "RUNTIME_ERROR"
                        : "WRONG_ANSWER";

                console.log(
                    `🏁 Run complete: ${overallStatus} (${testCasesPassed}/${testCases.length})`
                );

                return res.json({
                    success: true,
                    data: {
                        status: overallStatus,
                        testCaseResults,
                        testCasesPassed,
                        totalTestCases: testCases.length,
                        totalRuntime,
                        maxMemoryUsage,
                    },
                });
            } else {
                const result = await codeExecutor.executeCode(
                    code,
                    language,
                    req.body.input,
                    timeLimit,
                    memoryLimit
                );

                return res.json({
                    success: true,
                    data: result,
                });
            }
        } catch (error) {
            console.error("Execute endpoint error:", error);
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
