import { BaseRepository } from "./base.repository";
import { Submission, Prisma, SubmissionStatus, Language } from "@prisma/client";

export interface SubmissionWithRelations extends Submission {
    problem?: {
        id: string;
        title: string;
        slug: string;
        difficulty: string;
    };
    user?: {
        id: string;
        username: string;
        firstName?: string | null;
        lastName?: string | null;
    };
    testCaseResults?: any[];
}

export interface SubmissionStats {
    id: string;
    status: SubmissionStatus;
    testCasesPassed: number;
    totalTestCases: number;
    runtime: number;
    memoryUsage: number;
    errorMessage?: string;
    submittedAt: Date;
    completedAt?: Date;
}

export interface SubmissionQuery {
    userId?: string;
    problemId?: string;
    status?: SubmissionStatus;
    language?: Language;
    startDate?: Date;
    endDate?: Date;
}

export class SubmissionRepository extends BaseRepository<Submission, string> {
    constructor() {
        super("submission");
    }

    async createSubmission(data: {
        userId: string;
        problemId: string;
        language: Language;
        code: string;
        status?: SubmissionStatus;
        totalTestCases: number;
    }): Promise<SubmissionWithRelations> {
        try {
            const submission = await this.prisma.submission.create({
                data,
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
            });

            await this.prisma.userProblem.upsert({
                where: {
                    userId_problemId: {
                        userId: data.userId,
                        problemId: data.problemId,
                    },
                },
                update: {
                    attempts: {
                        increment: 1,
                    },
                    lastAttemptAt: new Date(),
                },
                create: {
                    userId: data.userId,
                    problemId: data.problemId,
                    attempts: 1,
                    firstAttemptAt: new Date(),
                    lastAttemptAt: new Date(),
                },
            });

            this.invalidateCache();

            return submission as SubmissionWithRelations;
        } catch (error) {
            throw new Error(
                `Failed to create submission: ${(error as Error).message}`
            );
        }
    }

    async updateSubmissionResults(
        id: string,
        results: {
            status: SubmissionStatus;
            testCasesPassed: number;
            runtime: number;
            memoryUsage: number;
            errorMessage?: string;
            testCaseResults?: any[];
        }
    ): Promise<Submission> {
        try {
            const submission = await this.prisma.submission.update({
                where: { id },
                data: {
                    ...results,
                    completedAt: new Date(),
                },
            });

            this.invalidateCacheForId(id);

            return submission as SubmissionWithRelations;
        } catch (error) {
            throw new Error(
                `Failed to update submission results: ${
                    (error as Error).message
                }`
            );
        }
    }

    async getSubmissionWithRelations(
        id: string,
        includeResults: boolean = false
    ): Promise<SubmissionWithRelations | null> {
        try {
            const submission = await this.prisma.submission.findUnique({
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
                return null;
            }

            if (includeResults && submission.status !== "PENDING") {
            }

            return submission as SubmissionWithRelations;
        } catch (error) {
            throw new Error(
                `Failed to get submission: ${(error as Error).message}`
            );
        }
    }

    async getProblemSubmissions(
        userId: string,
        problemId: string,
        options: {
            page: number;
            limit: number;
        }
    ): Promise<{
        submissions: SubmissionStats[];
        totalCount: number;
    }> {
        try {
            const { page, limit } = options;
            const skip = (page - 1) * limit;

            const [submissions, totalCount] = await Promise.all([
                this.prisma.submission.findMany({
                    where: {
                        userId,
                        problemId,
                    },
                    skip,
                    take: limit,
                    orderBy: { submittedAt: "desc" },
                    select: {
                        id: true,
                        status: true,
                        runtime: true,
                        memoryUsage: true,
                        testCasesPassed: true,
                        totalTestCases: true,
                        submittedAt: true,
                        completedAt: true,
                        errorMessage: true,
                    },
                }),
                this.prisma.submission.count({
                    where: {
                        userId,
                        problemId,
                    },
                }),
            ]);

            return {
                submissions: submissions as SubmissionStats[],
                totalCount,
            };
        } catch (error) {
            throw new Error(
                `Failed to get problem submissions: ${(error as Error).message}`
            );
        }
    }

    async getSubmissions(
        query: SubmissionQuery,
        options: {
            page: number;
            limit: number;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        }
    ): Promise<{
        submissions: SubmissionWithRelations[];
        totalCount: number;
    }> {
        try {
            const {
                page,
                limit,
                sortBy = "submittedAt",
                sortOrder = "desc",
            } = options;
            const skip = (page - 1) * limit;

            const where: Prisma.SubmissionWhereInput = {};

            if (query.userId) where.userId = query.userId;
            if (query.problemId) where.problemId = query.problemId;
            if (query.status) where.status = query.status;
            if (query.language) where.language = query.language;
            if (query.startDate || query.endDate) {
                where.submittedAt = {};
                if (query.startDate) where.submittedAt.gte = query.startDate;
                if (query.endDate) where.submittedAt.lte = query.endDate;
            }

            const [submissions, totalCount] = await Promise.all([
                this.prisma.submission.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        [sortBy]: sortOrder,
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
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                }),
                this.prisma.submission.count({ where }),
            ]);

            return {
                submissions: submissions as SubmissionWithRelations[],
                totalCount,
            };
        } catch (error) {
            throw new Error(
                `Failed to get submissions: ${(error as Error).message}`
            );
        }
    }

    async getSubmissionStats(
        filters: {
            userId?: string;
            problemId?: string;
            startDate?: Date;
            endDate?: Date;
        } = {}
    ): Promise<{
        total: number;
        byStatus: Record<SubmissionStatus, number>;
        byLanguage: Record<Language, number>;
        byDifficulty: Record<string, number>;
        acceptanceRate: number;
        averageRuntime: number;
        averageMemoryUsage: number;
    }> {
        try {
            const where: Prisma.SubmissionWhereInput = {};

            if (filters.userId) where.userId = filters.userId;
            if (filters.problemId) where.problemId = filters.problemId;
            if (filters.startDate || filters.endDate) {
                where.submittedAt = {};
                if (filters.startDate)
                    where.submittedAt.gte = filters.startDate;
                if (filters.endDate) where.submittedAt.lte = filters.endDate;
            }

            const [
                total,
                statusStats,
                languageStats,
                difficultyStats,
                runtimeStats,
                memoryStats,
            ] = await Promise.all([
                this.prisma.submission.count({ where }),
                this.prisma.submission.groupBy({
                    by: ["status"],
                    where,
                    _count: { status: true },
                }),
                this.prisma.submission.groupBy({
                    by: ["language"],
                    where,
                    _count: { language: true },
                }),
                this.prisma.submission.groupBy({
                    by: ["problemId"],
                    where,
                    _count: { problemId: true },
                }),
                this.prisma.submission.aggregate({
                    where: { ...where, runtime: { not: null } },
                    _avg: { runtime: true },
                }),
                this.prisma.submission.aggregate({
                    where: { ...where, memoryUsage: { not: null } },
                    _avg: { memoryUsage: true },
                }),
            ]);

            const byStatus = statusStats.reduce((acc, stat) => {
                acc[stat.status] = stat._count.status;
                return acc;
            }, {} as Record<SubmissionStatus, number>);

            const byLanguage = languageStats.reduce((acc, stat) => {
                acc[stat.language] = stat._count.language;
                return acc;
            }, {} as Record<Language, number>);

            difficultyStats.reduce((acc, _stat) => {
                return acc;
            }, {} as Record<string, number>);

            const acceptanceRate =
                total > 0 ? ((byStatus.ACCEPTED || 0) / total) * 100 : 0;

            const byDifficulty = difficultyStats.reduce((acc, _stat) => {
                return acc;
            }, {} as Record<string, number>);

            return {
                total,
                byStatus,
                byLanguage,
                byDifficulty,
                acceptanceRate,
                averageRuntime: runtimeStats._avg.runtime || 0,
                averageMemoryUsage: memoryStats._avg.memoryUsage || 0,
            };
        } catch (error) {
            throw new Error(
                `Failed to get submission stats: ${(error as Error).message}`
            );
        }
    }

    async getRecentSubmissions(
        userId: string,
        limit: number = 10
    ): Promise<SubmissionWithRelations[]> {
        try {
            const submissions = await this.prisma.submission.findMany({
                where: { userId },
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
            });

            return submissions as SubmissionWithRelations[];
        } catch (error) {
            throw new Error(
                `Failed to get recent submissions: ${(error as Error).message}`
            );
        }
    }

    async getPendingSubmissionsCount(userId: string): Promise<number> {
        try {
            return await this.prisma.submission.count({
                where: {
                    userId,
                    status: "PENDING",
                },
            });
        } catch (error) {
            throw new Error(
                `Failed to get pending submissions count: ${
                    (error as Error).message
                }`
            );
        }
    }

    async deleteOldSubmissions(
        userId: string,
        keepCount: number = 15
    ): Promise<number> {
        try {
            const userSubmissions = await this.prisma.submission.findMany({
                where: { userId },
                orderBy: { submittedAt: "desc" },
                select: { id: true },
            });

            if (userSubmissions.length <= keepCount) {
                return 0;
            }

            const submissionsToDelete = userSubmissions.slice(keepCount);
            const deleteResult = await this.prisma.submission.deleteMany({
                where: {
                    userId,
                    id: {
                        in: submissionsToDelete.map((s) => s.id),
                    },
                },
            });

            this.invalidateCache();

            return deleteResult.count;
        } catch (error) {
            throw new Error(
                `Failed to delete old submissions: ${(error as Error).message}`
            );
        }
    }

    async getSuccessRateOverTime(
        userId: string,
        days: number = 30
    ): Promise<
        Array<{
            date: string;
            submissions: number;
            accepted: number;
            rate: number;
        }>
    > {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const submissions = await this.prisma.submission.findMany({
                where: {
                    userId,
                    submittedAt: {
                        gte: startDate,
                    },
                },
                select: {
                    submittedAt: true,
                    status: true,
                },
                orderBy: { submittedAt: "asc" },
            });

            const dailyStats = submissions.reduce((acc, submission) => {
                const date = submission.submittedAt.toISOString().split("T")[0];

                if (!acc[date]) {
                    acc[date] = { submissions: 0, accepted: 0 };
                }

                acc[date].submissions++;
                if (submission.status === "ACCEPTED") {
                    acc[date].accepted++;
                }

                return acc;
            }, {} as Record<string, { submissions: number; accepted: number }>);

            return Object.entries(dailyStats).map(([date, stats]) => ({
                date,
                submissions: stats.submissions,
                accepted: stats.accepted,
                rate:
                    stats.submissions > 0
                        ? (stats.accepted / stats.submissions) * 100
                        : 0,
            }));
        } catch (error) {
            throw new Error(
                `Failed to get success rate over time: ${
                    (error as Error).message
                }`
            );
        }
    }

    private async updateProblemAcceptanceRate(
        problemId: string
    ): Promise<void> {
        try {
            const [totalSubmissions, acceptedSubmissions] = await Promise.all([
                this.prisma.submission.count({
                    where: { problemId },
                }),
                this.prisma.submission.count({
                    where: { problemId, status: "ACCEPTED" },
                }),
            ]);

            const acceptanceRate =
                totalSubmissions > 0
                    ? (acceptedSubmissions / totalSubmissions) * 100
                    : 0;

            await this.prisma.problem.update({
                where: { id: problemId },
                data: {
                    totalSubmissions,
                    acceptedSubmissions,
                    acceptanceRate,
                },
            });
        } catch (error) {
            console.error(
                `Failed to update problem acceptance rate: ${
                    (error as Error).message
                }`
            );
        }
    }
}
