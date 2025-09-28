import { Request, Response } from "express";
import { prisma } from "../utils/database";
import {
    ApiResponse,
    SubmissionRequest,
    JudgeResult,
    TestCaseResult,
} from "../types";
import { Language, SubmissionStatus } from "@prisma/client";
import { addSubmissionJob, getJobStatus } from "../queues/submissionQueue";
import { JudgeJobData } from "../types";

export class SubmissionController {
    static async submitCode(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "User not authenticated",
                });
                return;
            }

            const { problemId, language, code }: SubmissionRequest = req.body;

            if (!problemId || !language || !code) {
                res.status(400).json({
                    success: false,
                    error: "Problem ID, language, and code are required",
                });
                return;
            }

            const problem = await prisma.problem.findUnique({
                where: { id: problemId },
                include: {
                    testCases: true,
                },
            });

            if (!problem) {
                res.status(404).json({
                    success: false,
                    error: "Problem not found",
                });
                return;
            }

            const submission = await prisma.submission.create({
                data: {
                    userId,
                    problemId,
                    language: language as Language,
                    code,
                    status: SubmissionStatus.PENDING,
                    totalTestCases: problem.testCases.length,
                },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            difficulty: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            });

            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalSubmissions: {
                        increment: 1,
                    },
                },
            });

            await prisma.userProblem.upsert({
                where: {
                    userId_problemId: {
                        userId,
                        problemId,
                    },
                },
                update: {
                    attempts: {
                        increment: 1,
                    },
                    lastAttemptAt: new Date(),
                },
                create: {
                    userId,
                    problemId,
                    attempts: 1,
                    firstAttemptAt: new Date(),
                    lastAttemptAt: new Date(),
                },
            });

            const judgeJobData: JudgeJobData = {
                submissionId: submission.id,
                code,
                language,
                problemId,
                userId,
                testCases: problem.testCases.map((tc) => ({
                    input: tc.input,
                    output: tc.output,
                })),
            };

            const job = await addSubmissionJob(judgeJobData);

            const response: ApiResponse = {
                success: true,
                data: {
                    submissionId: submission.id,
                    jobId: job.id,
                    status: "PENDING",
                    message: "Code submitted successfully. Processing...",
                },
            };

            res.status(201).json(response);
        } catch (error) {
            console.error("Error submitting code:", error);
            res.status(500).json({
                success: false,
                error: "Failed to submit code",
            });
        }
    }

    static async runCode(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "User not authenticated",
                });
                return;
            }

            const { problemId, language, code }: SubmissionRequest = req.body;

            if (!problemId || !language || !code) {
                res.status(400).json({
                    success: false,
                    error: "Problem ID, language, and code are required",
                });
                return;
            }

            const problem = await prisma.problem.findUnique({
                where: { id: problemId },
                include: {
                    testCases: {
                        take: 3, // Limit to first 3 test cases for running
                        orderBy: { id: "asc" },
                    },
                },
            });

            if (!problem) {
                res.status(404).json({
                    success: false,
                    error: "Problem not found",
                });
                return;
            }

            if (problem.testCases.length === 0) {
                res.status(400).json({
                    success: false,
                    error: "No test cases available for this problem",
                });
                return;
            }

            const judgeUrl = process.env.JUDGE_URL || "http://localhost:3001";

            console.log(
                `🔗 Sending run request to judge service: ${judgeUrl}/api/execute`
            );
            console.log(`📝 Test cases found: ${problem.testCases.length}`);
            console.log(
                `📝 Test cases:`,
                problem.testCases.map((tc) => ({
                    input: tc.input,
                    output: tc.output,
                }))
            );

            try {
                const payload = {
                    code,
                    language: language.toLowerCase(),
                    testCases: problem.testCases.map((tc) => ({
                        input: tc.input,
                        output: tc.output,
                    })),
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit,
                };

                console.log(
                    `📝 Sending payload:`,
                    JSON.stringify(payload, null, 2)
                );

                const response = await fetch(`${judgeUrl}/api/execute`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                console.log(
                    `📊 Judge service response status: ${response.status}`
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(
                        `❌ Judge service error: ${response.status} - ${errorText}`
                    );
                    throw new Error(
                        `Judge service responded with ${response.status}: ${errorText}`
                    );
                }

                const result = (await response.json()) as any;
                console.log(
                    `📊 Judge service result:`,
                    JSON.stringify(result, null, 2)
                );

                if (!result.success) {
                    console.error(`❌ Judge execution failed:`, result);
                    res.status(500).json({
                        success: false,
                        error: result.error || "Code execution failed",
                    });
                    return;
                }

                console.log(`✅ Sending run result back to frontend`);

                const responseData = {
                    status: result.data?.status || "ERROR",
                    testCaseResults: result.data?.testCaseResults || [],
                    totalRuntime: result.data?.totalRuntime || 0,
                    maxMemoryUsage: result.data?.maxMemoryUsage || 0,
                    testCasesPassed: result.data?.testCasesPassed || 0,
                    totalTestCases: result.data?.totalTestCases || 0,
                };

                console.log(
                    `📤 Response data:`,
                    JSON.stringify(responseData, null, 2)
                );

                res.json({
                    success: true,
                    data: responseData,
                });
            } catch (judgeError) {
                console.error("Judge service error:", judgeError);
                res.status(500).json({
                    success: false,
                    error: "Failed to execute code. Judge service unavailable.",
                });
            }
        } catch (error) {
            console.error("Run code error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }

    static async getSubmissionStatus(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { id } = req.params;
            const { jobId } = req.query;

            if (jobId) {
                const jobStatus = await getJobStatus(jobId as string);

                if (!jobStatus) {
                    res.status(404).json({
                        success: false,
                        error: "Job not found",
                    });
                    return;
                }

                if (jobStatus.finishedOn && jobStatus.returnvalue?.result) {
                    const judgeResult = jobStatus.returnvalue.result;
                    res.json({
                        success: true,
                        data: {
                            status: judgeResult.status,
                            testCasesPassed: judgeResult.testCasesPassed,
                            totalTestCases: judgeResult.totalTestCases,
                            runtime: judgeResult.totalRuntime,
                            memoryUsage: judgeResult.maxMemoryUsage,
                            errorMessage: judgeResult.error || null,
                            testCaseResults: judgeResult.testCaseResults || [], // Include detailed test case results
                        },
                    });
                } else {
                    // Job still processing
                    res.json({
                        success: true,
                        data: {
                            status: jobStatus.finishedOn
                                ? "COMPLETED"
                                : "PENDING",
                            progress: jobStatus.progress || 0,
                        },
                    });
                }
                return;
            }

            const submission = await prisma.submission.findUnique({
                where: { id },
                select: {
                    id: true,
                    status: true,
                    testCasesPassed: true,
                    totalTestCases: true,
                    runtime: true,
                    memoryUsage: true,
                    errorMessage: true,
                },
            });

            if (!submission) {
                res.status(404).json({
                    success: false,
                    error: "Submission not found",
                });
                return;
            }

            res.json({
                success: true,
                data: submission,
            });
        } catch (error) {
            console.error("Error getting submission status:", error);
            res.status(500).json({
                success: false,
                error: "Failed to get submission status",
            });
        }
    }

    static async getSubmission(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const submission = await prisma.submission.findUnique({
                where: { id },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            difficulty: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            if (!submission) {
                res.status(404).json({
                    success: false,
                    error: "Submission not found",
                });
                return;
            }

            if (submission.userId !== userId) {
                res.status(403).json({
                    success: false,
                    error: "Access denied",
                });
                return;
            }

            const response: ApiResponse = {
                success: true,
                data: submission,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching submission:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch submission",
            });
        }
    }

    static async getProblemSubmissions(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { problemId } = req.params;
            const userId = req.user?.id;
            const { page = 1, limit = 10 } = req.query;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "User not authenticated",
                });
                return;
            }

            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            const [submissions, totalCount] = await Promise.all([
                prisma.submission.findMany({
                    where: {
                        problemId,
                        userId,
                    },
                    skip,
                    take,
                    orderBy: { submittedAt: "desc" },
                    select: {
                        id: true,
                        language: true,
                        status: true,
                        runtime: true,
                        memoryUsage: true,
                        testCasesPassed: true,
                        totalTestCases: true,
                        submittedAt: true,
                        completedAt: true,
                    },
                }),
                prisma.submission.count({
                    where: {
                        problemId,
                        userId,
                    },
                }),
            ]);

            const response: ApiResponse = {
                success: true,
                data: {
                    submissions,
                    pagination: {
                        currentPage: Number(page),
                        totalPages: Math.ceil(totalCount / take),
                        totalItems: totalCount,
                        hasNext: skip + take < totalCount,
                        hasPrev: Number(page) > 1,
                    },
                },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching problem submissions:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch submissions",
            });
        }
    }
}
