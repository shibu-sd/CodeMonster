import { Request, Response } from "express";
import { prisma } from "../utils/database";
import { SubmissionStatus } from "@prisma/client";
import { JudgeJobResult } from "../types";
import { SubmissionCleanupService } from "../services/submissionCleanupService";
import { problemRepository } from "../repositories";
import { BattleService } from "../services/battleService";
import { config } from "../config";

let battleSocket: any = null;
try {
    const socketModule = require("../websocket/battleSocket");
} catch (error) {
    console.log("Battle socket not available (battles disabled)");
}

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

    await prisma.submission.update({
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

        problemRepository.invalidateCacheForId(problemId);
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

        problemRepository.invalidateCacheForId(problemId);
    }

    console.log(
        `📊 Updated submission ${submissionId} with status: ${judgeResult.status}`
    );

    await handleBattleSubmission(submissionId, userId, judgeResult);

    SubmissionCleanupService.cleanupUserSubmissions(userId).catch((error) =>
        console.error("Error during submission cleanup:", error)
    );
}

async function handleBattleSubmission(
    submissionId: string,
    userId: string,
    judgeResult: any
): Promise<void> {
    try {
        if (!config.battle.enabled) {
            return;
        }

        const battleSubmissions = await prisma.battleSubmission.findMany({
            where: { submissionId },
            include: {
                battle: {
                    include: {
                        participants: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                participant: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (battleSubmissions.length === 0) {
            return; // Not a battle submission
        }

        console.log(
            `⚔️ Processing ${battleSubmissions.length} battle submission updates`
        );

        for (const battleSubmission of battleSubmissions) {
            const battle = battleSubmission.battle;

            if (battle.status !== "ACTIVE") {
                continue; // Battle is not active
            }

            await prisma.battleSubmission.update({
                where: { id: battleSubmission.id },
                data: {
                    status: judgeResult.status,
                    testCasesPassed: judgeResult.testCasesPassed,
                    totalTestCases: judgeResult.totalTestCases,
                    runtime: judgeResult.totalRuntime,
                    memoryUsage: judgeResult.maxMemoryUsage,
                    errorMessage: judgeResult.errorMessage,
                    completedAt: new Date(),
                },
            });

            await BattleService.updateParticipantScore(
                battle.id,
                userId,
                judgeResult.testCasesPassed
            );

            // Broadcast result to battle participants
            const battleModule = require("../websocket/battleSocket");

            try {
                const globalAny = global as any;
                if (globalAny.battleSocket) {
                    globalAny.battleSocket.broadcastSubmissionResult(
                        battle.id,
                        userId,
                        {
                            status: judgeResult.status,
                            testCasesPassed: judgeResult.testCasesPassed,
                            totalTestCases: judgeResult.totalTestCases,
                            runtime: judgeResult.totalRuntime,
                            memoryUsage: judgeResult.maxMemoryUsage,
                            errorMessage: judgeResult.errorMessage,
                        }
                    );
                }
            } catch (socketError) {
                console.error(
                    "Failed to broadcast battle submission result:",
                    socketError
                );
            }

            if (
                judgeResult.status === "ACCEPTED" &&
                judgeResult.testCasesPassed === judgeResult.totalTestCases
            ) {
                console.log(
                    `🏆 User ${userId} achieved AC in battle ${battle.id}`
                );

                const winnerId = await BattleService.determineWinner(battle.id);
                const finishedBattle = await BattleService.finishBattle(
                    battle.id,
                    winnerId || undefined
                );

                // Broadcast battle finish
                try {
                    const globalAny = global as any;
                    if (globalAny.battleSocket) {
                        globalAny.battleSocket.broadcastBattleFinish(
                            battle.id,
                            winnerId,
                            "accepted"
                        );
                    }
                } catch (socketError) {
                    console.error(
                        "Failed to broadcast battle finish:",
                        socketError
                    );
                }

                console.log(
                    `⚔️ Battle ${battle.id} finished. Winner: ${
                        winnerId || "Draw"
                    }`
                );
            }
        }
    } catch (error) {
        console.error("Error handling battle submission:", error);
    }
}
