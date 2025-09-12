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

                res.json({
                    success: true,
                    data: {
                        submissionId: id,
                        jobId,
                        status: jobStatus.finishedOn
                            ? "COMPLETED"
                            : "PROCESSING",
                        progress: jobStatus.progress,
                        result: jobStatus.returnvalue,
                    },
                });
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
