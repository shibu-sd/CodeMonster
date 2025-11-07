import { PrismaClient, BattleStatus, ParticipantStatus } from "@prisma/client";
import { redisConnection } from "../queues/submissionQueue";
import { logger } from "../utils/logger";
import { config } from "../config";

export interface BattleQueueItem {
    userId: string;
    username: string;
    profileImageUrl?: string;
    addedAt: number;
}

export interface BattleCreationData {
    problemId: string;
    timeLimit?: number;
    isPublic?: boolean;
}

export interface BattleJoinData {
    battleId: string;
    userId: string;
}

const prisma = new PrismaClient();

export class BattleService {
    static async addToQueue(
        user: BattleQueueItem,
        battleSocket?: any
    ): Promise<void> {
        const queueKey = "battle:queue";

        try {
            await redisConnection.lpush(queueKey, JSON.stringify(user));
            logger.info(`User ${user.username} added to battle queue`);

            await this.tryMatchUsers(battleSocket);
        } catch (error) {
            logger.error("Failed to add user to battle queue:", error);
            throw error;
        }
    }

    static async removeFromQueue(userId: string): Promise<void> {
        const queueKey = "battle:queue";

        try {
            const queue = await redisConnection.lrange(queueKey, 0, -1);
            const filteredQueue = queue.filter((item) => {
                const parsed = JSON.parse(item) as BattleQueueItem;
                return parsed.userId !== userId;
            });

            await redisConnection.del(queueKey);
            if (filteredQueue.length > 0) {
                await redisConnection.lpush(queueKey, ...filteredQueue);
            }

            logger.info(`User ${userId} removed from battle queue`);
        } catch (error) {
            logger.error("Failed to remove user from battle queue:", error);
            throw error;
        }
    }

    static async getQueueStatus(): Promise<BattleQueueItem[]> {
        const queueKey = "battle:queue";

        try {
            const queue = await redisConnection.lrange(queueKey, 0, -1);
            return queue.map((item) => JSON.parse(item)) as BattleQueueItem[];
        } catch (error) {
            logger.error("Failed to get queue status:", error);
            return [];
        }
    }

    static async tryMatchUsers(battleSocket?: any): Promise<string | null> {
        const queueKey = "battle:queue";
        const requiredPlayers = 2;

        try {
            const queue = await redisConnection.lrange(queueKey, 0, -1);

            if (queue.length >= requiredPlayers) {
                // Get first two users
                const user1Str = await redisConnection.rpop(queueKey);
                const user2Str = await redisConnection.rpop(queueKey);

                if (!user1Str || !user2Str) {
                    return null; // Not enough users
                }

                const user1 = JSON.parse(user1Str) as BattleQueueItem;
                const user2 = JSON.parse(user2Str) as BattleQueueItem;

                // Create battle
                const battle = await this.createBattle({
                    problemId: await this.getRandomProblemId(),
                    timeLimit: config.battle.timeLimit,
                    isPublic: true,
                });

                // Add participants
                await this.addParticipant(battle.id, user1.userId || "");
                await this.addParticipant(battle.id, user2.userId || "");

                const battleWithDetails = await this.getBattle(battle.id);

                if (battleSocket) {
                    battleSocket.sendBattleMatched(user1.userId, {
                        battleId: battle.id,
                        opponent: {
                            id: user2.userId || "",
                            username: user2.username,
                            profileImageUrl: user2.profileImageUrl,
                        },
                        problem: battleWithDetails?.problem,
                    });

                    battleSocket.sendBattleMatched(user2.userId, {
                        battleId: battle.id,
                        opponent: {
                            id: user1.userId || "",
                            username: user1.username,
                            profileImageUrl: user1.profileImageUrl,
                        },
                        problem: battleWithDetails?.problem,
                    });
                }

                setTimeout(async () => {
                    await this.startBattle(battle.id, battleSocket);
                }, 1000);

                logger.info(
                    `Battle created: ${battle.id} between ${user1.username} and ${user2.username}`
                );
                return battle.id;
            }

            return null;
        } catch (error) {
            logger.error("Failed to match users:", error);
            throw error;
        }
    }

    static async createBattle(data: BattleCreationData) {
        try {
            const battle = await prisma.battle.create({
                data: {
                    problemId: data.problemId,
                    timeLimit: data.timeLimit || config.battle.timeLimit,
                    isPublic: data.isPublic ?? true,
                    status: BattleStatus.WAITING,
                },
                include: {
                    problem: true,
                },
            });

            logger.info(
                `Battle created: ${battle.id} with problem ${battle.problemId}`
            );
            return battle;
        } catch (error) {
            logger.error("Failed to create battle:", error);
            throw error;
        }
    }

    static async addParticipant(battleId: string, userId: string) {
        try {
            const participant = await prisma.battleParticipant.create({
                data: {
                    battleId,
                    userId,
                    status: ParticipantStatus.JOINED,
                },
                include: {
                    user: true,
                },
            });

            logger.info(`Participant ${userId} added to battle ${battleId}`);
            return participant;
        } catch (error) {
            logger.error("Failed to add participant to battle:", error);
            throw error;
        }
    }

    static async startBattle(battleId: string, battleSocket?: any) {
        try {
            const battle = await prisma.battle.update({
                where: { id: battleId },
                data: {
                    status: BattleStatus.ACTIVE,
                    startTime: new Date(),
                },
                include: {
                    participants: {
                        include: {
                            user: true,
                        },
                    },
                    problem: true,
                },
            });

            logger.info(`Battle ${battleId} started`);

            if (battleSocket) {
                logger.info(
                    `battleSocket is available, broadcasting battle-start for ${battleId}`
                );
                battleSocket.broadcastBattleStart(battleId, battle.timeLimit);
            } else {
                logger.warn(
                    `battleSocket is undefined, cannot broadcast battle-start for ${battleId}`
                );
            }

            return battle;
        } catch (error) {
            logger.error("Failed to start battle:", error);
            throw error;
        }
    }

    static async finishBattle(battleId: string, winnerId?: string) {
        try {
            const battle = await prisma.battle.update({
                where: { id: battleId },
                data: {
                    status: BattleStatus.COMPLETED,
                    endTime: new Date(),
                    winnerId,
                },
                include: {
                    participants: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            if (winnerId) {
                await prisma.user.update({
                    where: { id: winnerId },
                    data: {
                        battlesWon: {
                            increment: 1,
                        },
                    },
                });
                logger.info(`Incremented battlesWon for user ${winnerId}`);
            }

            logger.info(
                `Battle ${battleId} finished. Winner: ${winnerId || "Draw"}`
            );
            return battle;
        } catch (error) {
            logger.error("Failed to finish battle:", error);
            throw error;
        }
    }

    static async getBattle(battleId: string) {
        try {
            return await prisma.battle.findUnique({
                where: { id: battleId },
                include: {
                    problem: true,
                    participants: {
                        include: {
                            user: true,
                        },
                    },
                    submissions: {
                        include: {
                            participant: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            });
        } catch (error) {
            logger.error("Failed to get battle:", error);
            throw error;
        }
    }

    static async getBattlesForUser(userId: string) {
        try {
            return await prisma.battle.findMany({
                where: {
                    participants: {
                        some: {
                            userId,
                        },
                    },
                },
                include: {
                    problem: true,
                    participants: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } catch (error) {
            logger.error("Failed to get battles for user:", error);
            throw error;
        }
    }

    static async updateParticipantScore(
        battleId: string,
        userId: string,
        testCasesPassed: number
    ) {
        try {
            const currentParticipant = await prisma.battleParticipant.findFirst(
                {
                    where: {
                        battleId,
                        userId,
                    },
                }
            );

            const participant = await prisma.battleParticipant.updateMany({
                where: {
                    battleId,
                    userId,
                },
                data: {
                    score: Math.max(
                        testCasesPassed,
                        currentParticipant?.score || 0
                    ),
                },
            });

            logger.info(
                `Updated score for user ${userId} in battle ${battleId}: ${testCasesPassed}`
            );
            return participant;
        } catch (error) {
            logger.error("Failed to update participant score:", error);
            throw error;
        }
    }

    static async handleDisconnection(battleId: string, userId: string) {
        try {
            const participant = await prisma.battleParticipant.updateMany({
                where: {
                    battleId,
                    userId,
                },
                data: {
                    status: ParticipantStatus.DISCONNECTED,
                    finishedAt: new Date(),
                },
            });

            const battle = await prisma.battle.findUnique({
                where: { id: battleId },
                include: {
                    participants: true,
                },
            });

            if (battle && battle.status === BattleStatus.ACTIVE) {
                const activeParticipants = battle.participants.filter(
                    (p) => p.status === ParticipantStatus.JOINED
                );

                if (activeParticipants.length <= 1) {
                    const winner = activeParticipants[0];
                    await this.finishBattle(battleId, winner?.userId);
                }
            }

            logger.info(`User ${userId} disconnected from battle ${battleId}`);
            return participant;
        } catch (error) {
            logger.error("Failed to handle disconnection:", error);
            throw error;
        }
    }

    static async getRandomProblemId(): Promise<string> {
        try {
            const problems = await prisma.problem.findMany({
                where: {
                    isPublic: true,
                },
                select: {
                    id: true,
                },
            });

            if (problems.length === 0) {
                throw new Error("No public problems available");
            }

            const randomIndex = Math.floor(Math.random() * problems.length);
            return problems[randomIndex].id;
        } catch (error) {
            logger.error("Failed to get random problem:", error);
            throw error;
        }
    }

    static async determineWinner(battleId: string): Promise<string | null> {
        try {
            const battle = await prisma.battle.findUnique({
                where: { id: battleId },
                include: {
                    participants: {
                        where: {
                            status: ParticipantStatus.JOINED,
                        },
                    },
                },
            });

            if (!battle || battle.participants.length !== 2) {
                return null;
            }

            const [participant1, participant2] = battle.participants;

            const submissions = await prisma.battleSubmission.findMany({
                where: {
                    battleId,
                    participantId: {
                        in: [participant1.id, participant2.id],
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            const p1Best = submissions
                .filter((s) => s.participantId === participant1.id)
                .sort((a, b) => b.testCasesPassed - a.testCasesPassed)[0];

            const p2Best = submissions
                .filter((s) => s.participantId === participant2.id)
                .sort((a, b) => b.testCasesPassed - a.testCasesPassed)[0];

            if (
                p1Best &&
                p1Best.testCasesPassed === p1Best.totalTestCases &&
                (!p2Best || p1Best.testCasesPassed > p2Best.testCasesPassed)
            ) {
                return participant1.userId;
            }

            if (
                p2Best &&
                p2Best.testCasesPassed === p2Best.totalTestCases &&
                (!p1Best || p2Best.testCasesPassed > p1Best.testCasesPassed)
            ) {
                return participant2.userId;
            }

            if (p1Best && p2Best) {
                if (p1Best.testCasesPassed > p2Best.testCasesPassed) {
                    return participant1.userId;
                } else if (p2Best.testCasesPassed > p1Best.testCasesPassed) {
                    return participant2.userId;
                } else {
                    // Tie - determine by earlier submission
                    return p1Best.createdAt < p2Best.createdAt
                        ? participant1.userId
                        : participant2.userId;
                }
            } else if (p1Best) {
                return participant1.userId;
            } else if (p2Best) {
                return participant2.userId;
            }

            return null; // Draw
        } catch (error) {
            logger.error("Failed to determine winner:", error);
            throw error;
        }
    }
}
