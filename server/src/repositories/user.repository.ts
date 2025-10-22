import { BaseRepository } from "./base.repository";
import { User, Prisma, SubmissionStatus, Language } from "@prisma/client";
import { UserStats } from "../types";

export interface UserWithSubmissions {
    id: string;
    userId: string;
    problemId: string;
    language: Language;
    status: SubmissionStatus;
    code: string;
    runtime?: number | null;
    memoryUsage?: number | null;
    errorMessage?: string | null;
    testCasesPassed: number;
    totalTestCases: number;
    submittedAt: Date;
    completedAt?: Date | null;
    user?: {
        id: string;
        username: string | null;
    };
    problem?: {
        id: string;
        title: string;
        slug: string;
        difficulty: string;
    };
}

export interface UserProfile {
    id: string;
    clerkId: string;
    email: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
    createdAt: Date;
    stats: UserStats;
}

export class UserRepository extends BaseRepository<User, string> {
    constructor() {
        super("user");
    }

    async findByClerkId(clerkId: string): Promise<User | null> {
        try {
            const cacheKey = `user:clerk:${clerkId}`;

            let result = this.cache.get(cacheKey);
            if (result) {
                return result as User;
            }

            const user = await this.prisma.user.findUnique({
                where: { clerkId },
            });

            if (user) {
                this.cache.set(cacheKey, user);
            }

            return user;
        } catch (error) {
            throw new Error(
                `Failed to find user by Clerk ID: ${(error as Error).message}`
            );
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const cacheKey = `user:email:${email}`;

            let result = this.cache.get(cacheKey);
            if (result) {
                return result as User;
            }

            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (user) {
                this.cache.set(cacheKey, user);
            }

            return user;
        } catch (error) {
            throw new Error(
                `Failed to find user by email: ${(error as Error).message}`
            );
        }
    }

    async createUserFromClerk(clerkData: {
        id: string;
        email: string;
        username?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        profileImageUrl?: string | null;
    }): Promise<User> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    clerkId: clerkData.id,
                    email: clerkData.email,
                    username: clerkData.username,
                    firstName: clerkData.firstName,
                    lastName: clerkData.lastName,
                    profileImageUrl: clerkData.profileImageUrl,
                },
            });

            this.invalidateCache();

            return user;
        } catch (error) {
            if ((error as any).code === "P2002") {
                throw new Error("User with this email already exists");
            }
            throw new Error(
                `Failed to create user: ${(error as Error).message}`
            );
        }
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const cacheKey = `user:profile:${userId}`;

            let result = this.cache.get(cacheKey);
            if (result) {
                return result as unknown as UserProfile;
            }

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    _count: {
                        select: {
                            submissions: true,
                        },
                    },
                },
            });

            if (!user) {
                return null;
            }

            const stats = await this.getUserStats(userId);

            const userProfile: UserProfile = {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImageUrl: user.profileImageUrl,
                createdAt: user.createdAt,
                stats,
            };

            this.cache.set(cacheKey, userProfile as unknown as User);
            return userProfile;
        } catch (error) {
            throw new Error(
                `Failed to get user profile: ${(error as Error).message}`
            );
        }
    }

    async getUserStats(userId: string): Promise<UserStats> {
        try {
            const cacheKey = `user:stats:${userId}`;

            let result = this.cache.get(cacheKey);
            if (result) {
                return result as unknown as UserStats;
            }

            const [totalSubmissions, acceptedSubmissions, , ,] =
                await Promise.all([
                    this.prisma.submission.count({
                        where: { userId },
                    }),
                    this.prisma.submission.count({
                        where: { userId, status: "ACCEPTED" },
                    }),
                    this.prisma.userProblem.aggregate({
                        where: { userId },
                        _count: true,
                    }),
                    this.prisma.submission.groupBy({
                        by: ["status"],
                        where: { userId },
                        _count: { status: true },
                    }),
                ]);

            const problemsSolved = await this.prisma.userProblem.count({
                where: {
                    userId,
                    isSolved: true,
                },
            });

            const easySolved = await this.prisma.userProblem.count({
                where: {
                    userId,
                    isSolved: true,
                    problem: {
                        difficulty: "EASY",
                    },
                },
            });

            const mediumSolved = await this.prisma.userProblem.count({
                where: {
                    userId,
                    isSolved: true,
                    problem: {
                        difficulty: "MEDIUM",
                    },
                },
            });

            const hardSolved = await this.prisma.userProblem.count({
                where: {
                    userId,
                    isSolved: true,
                    problem: {
                        difficulty: "HARD",
                    },
                },
            });

            const stats: UserStats = {
                problemsSolved,
                totalSubmissions,
                acceptedSubmissions,
                acceptanceRate:
                    totalSubmissions > 0
                        ? (acceptedSubmissions / totalSubmissions) * 100
                        : 0,
                easyProblemsCount: easySolved,
                mediumProblemsCount: mediumSolved,
                hardProblemsCount: hardSolved,
            };

            this.cache.set(cacheKey, stats as unknown as User);
            return stats;
        } catch (error) {
            throw new Error(
                `Failed to get user stats: ${(error as Error).message}`
            );
        }
    }

    async updateUserProfile(
        userId: string,
        data: {
            username?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            profileImageUrl?: string | null;
        }
    ): Promise<User> {
        try {
            const user = await this.prisma.user.update({
                where: { id: userId },
                data,
            });

            this.invalidateCacheForId(userId);

            return user;
        } catch (error) {
            if ((error as any).code === "P2025") {
                throw new Error("User not found");
            }
            if ((error as any).code === "P2002") {
                throw new Error("Username already taken");
            }
            throw new Error(
                `Failed to update user profile: ${(error as Error).message}`
            );
        }
    }

    async getUserSubmissions(
        userId: string,
        options: {
            page: number;
            limit: number;
            problemId?: string;
            status?: SubmissionStatus;
            language?: Language;
        }
    ): Promise<{
        submissions: UserWithSubmissions[];
        totalCount: number;
    }> {
        try {
            const { page, limit, problemId, status, language } = options;
            const skip = (page - 1) * limit;

            const where: Prisma.SubmissionWhereInput = { userId };
            if (problemId) where.problemId = problemId;
            if (status) where.status = status;
            if (language) where.language = language;

            const [submissions, totalCount] = await Promise.all([
                this.prisma.submission.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { submittedAt: "desc" },
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
                            },
                        },
                    },
                }),
                this.prisma.submission.count({ where }),
            ]);

            return {
                submissions: submissions as UserWithSubmissions[],
                totalCount,
            };
        } catch (error) {
            throw new Error(
                `Failed to get user submissions: ${(error as Error).message}`
            );
        }
    }

    async getUserProgress(userId: string): Promise<{
        totalProblems: number;
        solvedProblems: number;
        attemptedProblems: number;
        byDifficulty: {
            easy: { total: number; solved: number };
            medium: { total: number; solved: number };
            hard: { total: number; solved: number };
        };
        recentActivity: Array<{
            problemId: string;
            problemTitle: string;
            status: SubmissionStatus;
            submittedAt: Date;
        }>;
    }> {
        try {
            const cacheKey = `user:progress:${userId}`;

            let result = this.cache.get(cacheKey);
            if (result) {
                return result as any;
            }

            const [
                totalProblems,
                userProblems,
                solvedProblems,
                recentSubmissions,
            ] = await Promise.all([
                this.prisma.problem.count({ where: { isPublic: true } }),
                this.prisma.userProblem.count({ where: { userId } }),
                this.prisma.userProblem.count({
                    where: { userId, isSolved: true },
                }),
                this.prisma.submission.findMany({
                    where: { userId },
                    orderBy: { submittedAt: "desc" },
                    take: 10,
                    include: {
                        problem: {
                            select: {
                                title: true,
                            },
                        },
                    },
                }),
            ]);

            const [easyStats, mediumStats, hardStats] = await Promise.all([
                this.getDifficultyStats(userId, "EASY"),
                this.getDifficultyStats(userId, "MEDIUM"),
                this.getDifficultyStats(userId, "HARD"),
            ]);

            const progress = {
                totalProblems,
                solvedProblems,
                attemptedProblems: userProblems,
                byDifficulty: {
                    easy: easyStats,
                    medium: mediumStats,
                    hard: hardStats,
                },
                recentActivity: recentSubmissions.map((sub) => ({
                    problemId: sub.problemId,
                    problemTitle: sub.problem.title,
                    status: sub.status,
                    submittedAt: sub.submittedAt,
                })),
            };

            this.cache.set(cacheKey, progress as unknown as User);
            return progress;
        } catch (error) {
            throw new Error(
                `Failed to get user progress: ${(error as Error).message}`
            );
        }
    }

    private async getDifficultyStats(
        userId: string,
        difficulty: "EASY" | "MEDIUM" | "HARD"
    ): Promise<{ total: number; solved: number }> {
        const [total, solved] = await Promise.all([
            this.prisma.problem.count({
                where: { difficulty, isPublic: true },
            }),
            this.prisma.userProblem.count({
                where: {
                    userId,
                    isSolved: true,
                    problem: { difficulty },
                },
            }),
        ]);

        return { total, solved };
    }

    async updateSubmissionStats(
        userId: string,
        increment: number = 1
    ): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    totalSubmissions: {
                        increment,
                    },
                },
            });

            this.invalidateCacheForId(userId);
        } catch (error) {
            throw new Error(
                `Failed to update submission stats: ${(error as Error).message}`
            );
        }
    }

    async isUsernameAvailable(
        username: string,
        excludeUserId?: string
    ): Promise<boolean> {
        try {
            const where: Prisma.UserWhereInput = { username };
            if (excludeUserId) {
                where.id = { not: excludeUserId };
            }

            const user = await this.prisma.user.findFirst({
                where,
                select: { id: true },
            });

            return !user;
        } catch (error) {
            throw new Error(
                `Failed to check username availability: ${
                    (error as Error).message
                }`
            );
        }
    }

    async getLeaderboard(options: {
        page: number;
        limit: number;
        timeFrame?: "all" | "week" | "month";
    }): Promise<{
        users: Array<{
            rank: number;
            user: User;
            stats: UserStats;
        }>;
        totalCount: number;
    }> {
        try {
            const { page, limit } = options;
            const skip = (page - 1) * limit;

            const users = await this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    clerkId: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    problemsSolved: true,
                    contestsJoined: true,
                    totalSubmissions: true,
                    acceptedSubmissions: true,
                },
                orderBy: {
                    problemsSolved: "desc",
                },
            });

            const usersWithStats = users.map((user, index) => {
                const stats: UserStats = {
                    problemsSolved: user.problemsSolved,
                    totalSubmissions: user.totalSubmissions,
                    acceptedSubmissions: user.acceptedSubmissions,
                    acceptanceRate:
                        user.totalSubmissions > 0
                            ? (user.acceptedSubmissions /
                                  user.totalSubmissions) *
                              100
                            : 0,
                    easyProblemsCount: 0,
                    mediumProblemsCount: 0,
                    hardProblemsCount: 0,
                };

                return {
                    rank: skip + index + 1,
                    user,
                    stats,
                };
            });

            const totalCount = await this.prisma.user.count();

            return { users: usersWithStats, totalCount };
        } catch (error) {
            throw new Error(
                `Failed to get leaderboard: ${(error as Error).message}`
            );
        }
    }
}
