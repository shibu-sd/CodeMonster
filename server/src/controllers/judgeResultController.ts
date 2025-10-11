import { Request, Response } from "express";
import { prisma } from "../utils/database";
import { SubmissionStatus } from "@prisma/client";
import { JudgeJobResult } from "../types";
import { SubmissionCleanupService } from "../services/submissionCleanupService";

export class JudgeResultController {
    static async handleJudgeResult(req: Request, res: Response): Promise<void> {
        try {
            const result: JudgeJobResult = req.body;

            if (!result.submissionId || !result.result) {
                res.status(400).json({
                    success: false,
                    error: "Invalid result data",
                });
                return;
            }

            console.log(
                `📨 Received judge result for submission ${result.submissionId}: ${result.result.status}`
            );

            await updateSubmissionResult(result);

            res.json({
                success: true,
                message: "Result processed successfully",
            });
        } catch (error) {
            console.error("Error processing judge result:", error);
            res.status(500).json({
                success: false,
                error: "Failed to process result",
            });
        }
    }
}

async function updateSubmissionResult(result: JudgeJobResult): Promise<void> {
    const { submissionId, result: judgeResult } = result;

    console.log(`🔍 Processing webhook for submission: ${submissionId}`);
    console.log(`🔍 Judge result:`, judgeResult);

    // First check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
            user: { select: { id: true } },
            problem: { select: { id: true } },
        },
    });

    if (!existingSubmission) {
        console.error(`❌ Submission ${submissionId} not found in database`);
        throw new Error(`Submission ${submissionId} not found`);
    }

    console.log(`✅ Found submission ${submissionId} in database`);

    const mapStatus = (status: string): SubmissionStatus => {
        switch (status) {
            case "ACCEPTED":
                return SubmissionStatus.ACCEPTED;
            case "WRONG_ANSWER":
                return SubmissionStatus.WRONG_ANSWER;
            case "TIME_LIMIT_EXCEEDED":
                return SubmissionStatus.TIME_LIMIT_EXCEEDED;
            case "MEMORY_LIMIT_EXCEEDED":
                return SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
            case "RUNTIME_ERROR":
                return SubmissionStatus.RUNTIME_ERROR;
            case "COMPILATION_ERROR":
                return SubmissionStatus.COMPILATION_ERROR;
            default:
                return SubmissionStatus.INTERNAL_ERROR;
        }
    };

    const mappedStatus = mapStatus(judgeResult.status);
    console.log(
        `🔄 Updating submission ${submissionId} to status: ${mappedStatus}`
    );

    const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
            status: mappedStatus,
            testCasesPassed: judgeResult.testCasesPassed,
            totalTestCases: judgeResult.totalTestCases,
            runtime: judgeResult.totalRuntime,
            memoryUsage: judgeResult.maxMemoryUsage,
            errorMessage: judgeResult.errorMessage,
            completedAt: new Date(),
        },
    });

    console.log(`✅ Updated submission ${submissionId} in database`);

    // Use existing submission data for subsequent updates
    const userId = existingSubmission.userId;
    const problemId = existingSubmission.problemId;

    if (judgeResult.status === "ACCEPTED") {
        console.log(
            `🎉 Submission accepted! Updating user and problem stats...`
        );

        const existingUserProblem = await prisma.userProblem.findUnique({
            where: {
                userId_problemId: {
                    userId: userId,
                    problemId: problemId,
                },
            },
        });

        const isFirstAccepted = !existingUserProblem?.isSolved;

        await prisma.user.update({
            where: { id: userId },
            data: {
                problemsSolved: isFirstAccepted
                    ? {
                          increment: 1,
                      }
                    : undefined,
                acceptedSubmissions: {
                    increment: 1,
                },
            },
        });

        await prisma.userProblem.upsert({
            where: {
                userId_problemId: {
                    userId: userId,
                    problemId: problemId,
                },
            },
            update: {
                isSolved: true,
                solvedAt: new Date(),
                acceptedSolution: existingSubmission.code,
                acceptedLanguage: existingSubmission.language,
                acceptedRuntime: judgeResult.totalRuntime,
                acceptedMemory: judgeResult.maxMemoryUsage,
            },
            create: {
                userId: userId,
                problemId: problemId,
                isSolved: true,
                solvedAt: new Date(),
                acceptedSolution: existingSubmission.code,
                acceptedLanguage: existingSubmission.language,
                acceptedRuntime: judgeResult.totalRuntime,
                acceptedMemory: judgeResult.maxMemoryUsage,
            },
        });

        const updatedProblem = await prisma.problem.update({
            where: { id: problemId },
            data: {
                totalSubmissions: {
                    increment: 1,
                },
                acceptedSubmissions: {
                    increment: 1,
                },
            },
        });

        const newAcceptanceRate =
            updatedProblem.totalSubmissions > 0
                ? updatedProblem.acceptedSubmissions /
                  updatedProblem.totalSubmissions
                : 0;

        await prisma.problem.update({
            where: { id: problemId },
            data: {
                acceptanceRate: newAcceptanceRate,
            },
        });

        console.log(
            `📊 Updated stats for ACCEPTED submission and saved solution`
        );
    } else {
        console.log(`📊 Updating problem stats for non-accepted submission...`);

        const updatedProblem = await prisma.problem.update({
            where: { id: problemId },
            data: {
                totalSubmissions: {
                    increment: 1,
                },
            },
        });

        const newAcceptanceRate =
            updatedProblem.totalSubmissions > 0
                ? updatedProblem.acceptedSubmissions /
                  updatedProblem.totalSubmissions
                : 0;

        await prisma.problem.update({
            where: { id: problemId },
            data: {
                acceptanceRate: newAcceptanceRate,
            },
        });
    }

    console.log(
        `📊 Updated submission ${submissionId} with status: ${judgeResult.status}`
    );

    SubmissionCleanupService.cleanupUserSubmissions(userId).catch((error) =>
        console.error("Error during submission cleanup:", error)
    );
}
