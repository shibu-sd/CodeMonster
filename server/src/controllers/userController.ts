import { Request, Response } from "express";
import { prisma } from "../utils/database";
import { ApiResponse, ClerkUser, UserStats } from "../types";

export class UserController {
    static async syncUserFromClerk(req: Request, res: Response): Promise<void> {
        try {
            const clerkUser: ClerkUser = req.body;

            if (!clerkUser.id) {
                res.status(400).json({
                    success: false,
                    error: "Clerk user ID is required",
                });
                return;
            }

            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) {
                res.status(400).json({
                    success: false,
                    error: "User email is required",
                });
                return;
            }

            const existingUser = await prisma.user.findUnique({
                where: { clerkId: clerkUser.id },
            });

            let user;
            if (existingUser) {
                user = await prisma.user.update({
                    where: { clerkId: clerkUser.id },
                    data: {
                        email,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        username: clerkUser.username,
                        profileImageUrl: clerkUser.profileImageUrl,
                    },
                });
            } else {
                user = await prisma.user.create({
                    data: {
                        clerkId: clerkUser.id,
                        email,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        username: clerkUser.username,
                        profileImageUrl: clerkUser.profileImageUrl,
                    },
                });
            }

            const response: ApiResponse = {
                success: true,
                data: user,
                message: existingUser
                    ? "User updated successfully"
                    : "User created successfully",
            };

            res.status(existingUser ? 200 : 201).json(response);
        } catch (error) {
            console.error("Error syncing user from Clerk:", error);
            res.status(500).json({
                success: false,
                error: "Failed to sync user",
            });
        }
    }

    static async getCurrentUserProfile(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "User not authenticated",
                });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                    problemsSolved: true,
                    contestsJoined: true,
                    totalSubmissions: true,
                    acceptedSubmissions: true,
                    createdAt: true,
                },
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
                return;
            }

            const response: ApiResponse = {
                success: true,
                data: user,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch user profile",
            });
        }
    }

    static async updateUserProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { username, firstName, lastName } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "User not authenticated",
                });
                return;
            }

            if (username) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        username,
                        NOT: { id: userId },
                    },
                });

                if (existingUser) {
                    res.status(409).json({
                        success: false,
                        error: "Username is already taken",
                    });
                    return;
                }
            }

            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    username,
                    firstName,
                    lastName,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                },
            });

            const response: ApiResponse = {
                success: true,
                data: user,
                message: "Profile updated successfully",
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error updating user profile:", error);
            res.status(500).json({
                success: false,
                error: "Failed to update profile",
            });
        }
    }

    static async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    problemsSolved: true,
                    totalSubmissions: true,
                    acceptedSubmissions: true,
                    userProblems: {
                        where: { isSolved: true },
                        select: {
                            problem: {
                                select: {
                                    difficulty: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
                return;
            }

            const acceptanceRate =
                user.totalSubmissions > 0
                    ? (user.acceptedSubmissions / user.totalSubmissions) * 100
                    : 0;

            const problemsByDifficulty = user.userProblems.reduce((acc, up) => {
                const difficulty = up.problem.difficulty.toLowerCase();
                acc[`${difficulty}ProblemsCount`] =
                    (acc[`${difficulty}ProblemsCount`] || 0) + 1;
                return acc;
            }, {} as any);

            const stats: UserStats = {
                problemsSolved: user.problemsSolved,
                totalSubmissions: user.totalSubmissions,
                acceptedSubmissions: user.acceptedSubmissions,
                acceptanceRate: Math.round(acceptanceRate * 100) / 100,
                easyProblemsCount: problemsByDifficulty.easyProblemsCount || 0,
                mediumProblemsCount:
                    problemsByDifficulty.mediumProblemsCount || 0,
                hardProblemsCount: problemsByDifficulty.hardProblemsCount || 0,
            };

            const response: ApiResponse = {
                success: true,
                data: stats,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching user stats:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch user statistics",
            });
        }
    }

    static async getUserDashboard(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized",
                });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profileImageUrl: true,
                    problemsSolved: true,
                    contestsJoined: true,
                    battlesWon: true,
                    totalSubmissions: true,
                    acceptedSubmissions: true,
                    createdAt: true,
                },
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
                return;
            }

            const solvedProblems = await prisma.userProblem.findMany({
                where: {
                    userId: userId,
                    isSolved: true,
                },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            difficulty: true,
                            tags: true,
                            acceptanceRate: true,
                        },
                    },
                },
                orderBy: {
                    solvedAt: "desc",
                },
            });

            const recentSubmissions = await prisma.submission.findMany({
                where: { userId: userId },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            difficulty: true,
                        },
                    },
                },
                orderBy: {
                    submittedAt: "desc",
                },
                take: 10,
            });

            const difficultyStats = {
                easy: 0,
                medium: 0,
                hard: 0,
            };

            solvedProblems.forEach((sp) => {
                const difficulty = sp.problem.difficulty.toLowerCase();
                if (difficulty === "easy") difficultyStats.easy++;
                else if (difficulty === "medium") difficultyStats.medium++;
                else if (difficulty === "hard") difficultyStats.hard++;
            });

            const tagStats: Record<string, number> = {};
            solvedProblems.forEach((sp) => {
                sp.problem.tags.forEach((tag) => {
                    tagStats[tag] = (tagStats[tag] || 0) + 1;
                });
            });

            const topTags = Object.entries(tagStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count }));

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const submissionHistory = await prisma.submission.groupBy({
                by: ["submittedAt"],
                where: {
                    userId: userId,
                    submittedAt: {
                        gte: thirtyDaysAgo,
                    },
                },
                _count: {
                    id: true,
                },
            });

            const acceptanceRate =
                user.totalSubmissions > 0
                    ? (user.acceptedSubmissions / user.totalSubmissions) * 100
                    : 0;

            res.json({
                success: true,
                data: {
                    user: {
                        ...user,
                        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
                    },
                    solvedProblems: solvedProblems.map((sp) => ({
                        id: sp.id,
                        problemId: sp.problem.id,
                        title: sp.problem.title,
                        slug: sp.problem.slug,
                        difficulty: sp.problem.difficulty,
                        tags: sp.problem.tags,
                        solvedAt: sp.solvedAt,
                        acceptedLanguage: sp.acceptedLanguage,
                        acceptedRuntime: sp.acceptedRuntime,
                        acceptedMemory: sp.acceptedMemory,
                    })),
                    recentSubmissions: recentSubmissions.map((sub) => ({
                        id: sub.id,
                        problemId: sub.problem.id,
                        problemTitle: sub.problem.title,
                        problemSlug: sub.problem.slug,
                        difficulty: sub.problem.difficulty,
                        language: sub.language,
                        status: sub.status,
                        runtime: sub.runtime,
                        memoryUsage: sub.memoryUsage,
                        submittedAt: sub.submittedAt,
                        completedAt: sub.completedAt,
                    })),
                    stats: {
                        difficultyBreakdown: difficultyStats,
                        topTags,
                        submissionHistory,
                    },
                },
            });
        } catch (error) {
            console.error("Error fetching user dashboard:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch dashboard data",
            });
        }
    }

    static async getUserSubmissions(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { id } = req.params;
            const { page = 1, limit = 20, status, problemId } = req.query;

            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            const where: any = { userId: id };

            if (status) {
                where.status = status;
            }

            if (problemId) {
                where.problemId = problemId;
            }

            const [submissions, totalCount] = await Promise.all([
                prisma.submission.findMany({
                    where,
                    skip,
                    take,
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
                    },
                }),
                prisma.submission.count({ where }),
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
            console.error("Error fetching user submissions:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch user submissions",
            });
        }
    }

    static async getUserProgress(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const userProblems = await prisma.userProblem.findMany({
                where: { userId: id },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            difficulty: true,
                            tags: true,
                        },
                    },
                },
                orderBy: { lastAttemptAt: "desc" },
            });

            const progress = {
                solved: userProblems.filter((up) => up.isSolved),
                attempted: userProblems.filter(
                    (up) => !up.isSolved && up.attempts > 0
                ),
                total: userProblems.length,
            };

            const response: ApiResponse = {
                success: true,
                data: {
                    progress,
                    userProblems,
                },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching user progress:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch user progress",
            });
        }
    }

    static async getUserSolution(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { problemId } = req.params;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized",
                });
                return;
            }

            const userProblem = await prisma.userProblem.findUnique({
                where: {
                    userId_problemId: {
                        userId: userId,
                        problemId: problemId,
                    },
                },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            difficulty: true,
                        },
                    },
                },
            });

            if (!userProblem || !userProblem.isSolved) {
                res.json({
                    success: true,
                    data: null,
                    message: "No accepted solution found",
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    problemId: userProblem.problem.id,
                    problemTitle: userProblem.problem.title,
                    problemSlug: userProblem.problem.slug,
                    difficulty: userProblem.problem.difficulty,
                    acceptedSolution: userProblem.acceptedSolution,
                    acceptedLanguage: userProblem.acceptedLanguage,
                    acceptedRuntime: userProblem.acceptedRuntime,
                    acceptedMemory: userProblem.acceptedMemory,
                    solvedAt: userProblem.solvedAt,
                },
            });
        } catch (error) {
            console.error("Error fetching user solution:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch solution",
            });
        }
    }

    static async getUserContributionData(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const userId = req.user?.id;
            const { year = new Date().getFullYear() } = req.query;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized",
                });
                return;
            }

            const startOfYear = new Date(Number(year), 0, 1);
            const endOfYear = new Date(Number(year), 11, 31, 23, 59, 59, 999);

            // Get all submissions for the user in the specified year
            const submissions = await prisma.submission.findMany({
                where: {
                    userId: userId,
                    submittedAt: {
                        gte: startOfYear,
                        lte: endOfYear,
                    },
                },
                select: {
                    submittedAt: true,
                    status: true,
                },
            });

            // Group submissions by date and count
            const submissionsByDate = new Map<string, number>();

            submissions.forEach((submission) => {
                const dateStr = submission.submittedAt
                    .toISOString()
                    .split("T")[0];
                const currentCount = submissionsByDate.get(dateStr) || 0;
                submissionsByDate.set(dateStr, currentCount + 1);
            });

            // Generate contribution data for the entire year
            const contributionData = [];
            const currentDate = new Date(startOfYear);

            while (currentDate <= endOfYear) {
                const dateStr = currentDate.toISOString().split("T")[0];
                const count = submissionsByDate.get(dateStr) || 0;

                // Calculate contribution level (0-4 based on count)
                let level = 0;
                if (count >= 1 && count <= 2) level = 1;
                else if (count >= 3 && count <= 5) level = 2;
                else if (count >= 6 && count <= 9) level = 3;
                else if (count >= 10) level = 4;

                contributionData.push({
                    date: dateStr,
                    count,
                    level,
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            const response: ApiResponse = {
                success: true,
                data: contributionData,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching user contribution data:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch contribution data",
            });
        }
    }
}
