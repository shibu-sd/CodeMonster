import { Request, Response } from "express";
import { BattleService } from "../services/battleService";
import { logger } from "../utils/logger";
import { config } from "../config";
import { prisma } from "../utils/database";

export class BattleController {
    static async joinQueue(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { userId, username, profileImageUrl } = req.body;

            if (!userId || !username) {
                return res.status(400).json({
                    success: false,
                    message: "User ID and username are required",
                });
            }

            await BattleService.addToQueue({
                userId,
                username,
                profileImageUrl,
                addedAt: Date.now(),
            });

            const queueStatus = await BattleService.getQueueStatus();

            res.json({
                success: true,
                message: "Successfully joined battle queue",
                data: {
                    usersInQueue: queueStatus.length,
                },
            });
        } catch (error) {
            logger.error("Error joining battle queue:", error);
            res.status(500).json({
                success: false,
                message: "Failed to join battle queue",
            });
        }
    }

    static async leaveQueue(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
            }

            await BattleService.removeFromQueue(userId);

            const queueStatus = await BattleService.getQueueStatus();

            res.json({
                success: true,
                message: "Successfully left battle queue",
                data: {
                    usersInQueue: queueStatus.length,
                },
            });
        } catch (error) {
            logger.error("Error leaving battle queue:", error);
            res.status(500).json({
                success: false,
                message: "Failed to leave battle queue",
            });
        }
    }

    static async getQueueStatus(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const queueStatus = await BattleService.getQueueStatus();

            res.json({
                success: true,
                data: {
                    usersInQueue: queueStatus.length,
                    users: queueStatus.map((user) => ({
                        userId: user.userId,
                        username: user.username,
                        addedAt: user.addedAt,
                    })),
                },
            });
        } catch (error) {
            logger.error("Error getting queue status:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get queue status",
            });
        }
    }

    static async createBattle(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { problemId, timeLimit, isPublic } = req.body;

            if (!problemId) {
                return res.status(400).json({
                    success: false,
                    message: "Problem ID is required",
                });
            }

            const problem = await prisma.problem.findUnique({
                where: { id: problemId },
            });

            if (!problem) {
                return res.status(404).json({
                    success: false,
                    message: "Problem not found",
                });
            }

            const battle = await BattleService.createBattle({
                problemId,
                timeLimit: timeLimit || config.battle.timeLimit,
                isPublic: isPublic ?? true,
            });

            res.json({
                success: true,
                message: "Battle created successfully",
                data: battle,
            });
        } catch (error) {
            logger.error("Error creating battle:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create battle",
            });
        }
    }

    static async joinBattle(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { battleId, userId } = req.body;

            if (!battleId || !userId) {
                return res.status(400).json({
                    success: false,
                    message: "Battle ID and User ID are required",
                });
            }

            const battle = await BattleService.getBattle(battleId);

            if (!battle) {
                return res.status(404).json({
                    success: false,
                    message: "Battle not found",
                });
            }

            if (battle.status !== "WAITING") {
                return res.status(400).json({
                    success: false,
                    message: "Battle is not accepting new participants",
                });
            }

            if (battle.participants.length >= battle.maxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: "Battle is full",
                });
            }

            const existingParticipant = battle.participants.find(
                (p) => p.userId === userId
            );
            if (existingParticipant) {
                return res.status(400).json({
                    success: false,
                    message: "User already joined this battle",
                });
            }

            const participant = await BattleService.addParticipant(
                battleId,
                userId
            );

            const updatedBattle = await BattleService.getBattle(battleId);
            if (updatedBattle && updatedBattle.participants.length >= 2) {
                await BattleService.startBattle(battleId);
            }

            res.json({
                success: true,
                message: "Successfully joined battle",
                data: {
                    participant,
                    battleStarted: updatedBattle?.status === "ACTIVE",
                },
            });
        } catch (error) {
            logger.error("Error joining battle:", error);
            res.status(500).json({
                success: false,
                message: "Failed to join battle",
            });
        }
    }

    static async getBattle(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Battle ID is required",
                });
            }

            const battle = await BattleService.getBattle(id);

            if (!battle) {
                return res.status(404).json({
                    success: false,
                    message: "Battle not found",
                });
            }

            res.json({
                success: true,
                data: battle,
            });
        } catch (error) {
            logger.error("Error getting battle:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get battle",
            });
        }
    }

    static async getUserBattles(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
            }

            const battles = await BattleService.getBattlesForUser(
                userId as string
            );

            res.json({
                success: true,
                data: battles,
            });
        } catch (error) {
            logger.error("Error getting user battles:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get user battles",
            });
        }
    }

    static async submitBattleCode(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { battleId, userId, problemId, language, code } = req.body;

            if (!battleId || !userId || !problemId || !language || !code) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            const battle = await BattleService.getBattle(battleId);

            if (!battle) {
                return res.status(404).json({
                    success: false,
                    message: "Battle not found",
                });
            }

            if (battle.status !== "ACTIVE") {
                return res.status(400).json({
                    success: false,
                    message: "Battle is not active",
                });
            }

            // Create battle submission
            const participant = battle.participants.find(
                (p) => p.userId === userId
            );
            if (!participant) {
                return res.status(400).json({
                    success: false,
                    message: "User is not a participant in this battle",
                });
            }

            const battleSubmission = await prisma.battleSubmission.create({
                data: {
                    battleId,
                    participantId: participant.id,
                    userId,
                    language,
                    code,
                    status: "PENDING",
                    totalTestCases: 1, // This will be updated by the judge
                },
            });

            const submission = await prisma.submission.create({
                data: {
                    userId,
                    problemId,
                    language,
                    code,
                    status: "PENDING",
                },
            });

            await prisma.battleSubmission.update({
                where: { id: battleSubmission.id },
                data: { submissionId: submission.id },
            });

            const { addSubmissionJob } = require("../queues/submissionQueue");
            await addSubmissionJob(submission.id);

            res.json({
                success: true,
                message: "Battle submission created successfully",
                data: {
                    battleSubmission,
                    submission,
                },
            });
        } catch (error) {
            logger.error("Error submitting battle code:", error);
            res.status(500).json({
                success: false,
                message: "Failed to submit battle code",
            });
        }
    }

    static async finishBattle(req: Request, res: Response) {
        try {
            if (!config.battle.enabled) {
                return res.status(403).json({
                    success: false,
                    message: "Battles are currently disabled",
                });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Battle ID is required",
                });
            }

            const battle = await BattleService.getBattle(id);

            if (!battle) {
                return res.status(404).json({
                    success: false,
                    message: "Battle not found",
                });
            }

            if (battle.status !== "ACTIVE") {
                return res.status(400).json({
                    success: false,
                    message: "Battle is not active",
                });
            }

            const winnerId = await BattleService.determineWinner(id);
            const finishedBattle = await BattleService.finishBattle(
                id,
                winnerId || undefined
            );

            res.json({
                success: true,
                message: "Battle finished successfully",
                data: {
                    battle: finishedBattle,
                    winnerId,
                },
            });
        } catch (error) {
            logger.error("Error finishing battle:", error);
            res.status(500).json({
                success: false,
                message: "Failed to finish battle",
            });
        }
    }
}
