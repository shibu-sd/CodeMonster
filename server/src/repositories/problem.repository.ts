import { BaseRepository } from "./base.repository";
import { Difficulty, Problem, Prisma, Language } from "@prisma/client";
import { ProblemFilters } from "../types";

export interface ProblemWithRelations extends Problem {
    testCases?: Array<{
        id: string;
        input: string;
        output: string;
        isHidden: boolean;
    }>;
    starterCode?: Array<{
        language: Language;
        code: string;
    }>;
}

export interface ProblemStats {
    id: string;
    title: string;
    slug: string;
    difficulty: Difficulty;
    tags: string[];
    acceptanceRate: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    createdAt: Date;
}

export class ProblemRepository extends BaseRepository<Problem, string> {
    constructor() {
        super("problem");
    }

    async findProblemsWithFilters(
        filters: ProblemFilters,
        pagination: {
            skip: number;
            take: number;
            sortBy: string;
            sortOrder: "asc" | "desc";
        }
    ): Promise<{ problems: ProblemStats[]; totalCount: number }> {
        try {
            const where: Prisma.ProblemWhereInput = {
                isPublic: true,
            };

            if (
                filters.difficulty &&
                ["EASY", "MEDIUM", "HARD"].includes(filters.difficulty)
            ) {
                where.difficulty = filters.difficulty as Difficulty;
            }

            if (
                filters.tags &&
                Array.isArray(filters.tags) &&
                filters.tags.length > 0
            ) {
                where.tags = {
                    hasEvery: filters.tags,
                };
            }

            if (filters.search) {
                where.OR = [
                    {
                        title: {
                            contains: filters.search,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: filters.search,
                            mode: "insensitive",
                        },
                    },
                ];
            }

            const [problems, totalCount] = await Promise.all([
                this.prisma.problem.findMany({
                    where,
                    skip: pagination.skip,
                    take: pagination.take,
                    orderBy: {
                        [pagination.sortBy]: pagination.sortOrder,
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        difficulty: true,
                        tags: true,
                        acceptanceRate: true,
                        totalSubmissions: true,
                        acceptedSubmissions: true,
                        createdAt: true,
                    },
                }),
                this.prisma.problem.count({ where }),
            ]);

            return { problems, totalCount };
        } catch (error) {
            throw new Error(
                `Failed to find problems with filters: ${
                    (error as Error).message
                }`
            );
        }
    }

    async findProblemByIdentifier(
        identifier: string
    ): Promise<ProblemWithRelations | null> {
        try {
            const cacheKey = `problem:identifier:${identifier}`;

            let result = this.cache.get(cacheKey);
            if (result) {
                return result as ProblemWithRelations;
            }

            const problem = await this.prisma.problem.findFirst({
                where: {
                    OR: [{ id: identifier }, { slug: identifier }],
                    isPublic: true,
                },
                include: {
                    testCases: {
                        where: { isHidden: false },
                        select: {
                            id: true,
                            input: true,
                            output: true,
                        },
                    },
                    starterCode: {
                        select: {
                            language: true,
                            code: true,
                        },
                    },
                },
            });

            if (problem) {
                this.cache.set(cacheKey, problem as ProblemWithRelations);
            }

            return problem as ProblemWithRelations;
        } catch (error) {
            throw new Error(
                `Failed to find problem by identifier: ${
                    (error as Error).message
                }`
            );
        }
    }

    async createProblemWithRelations(
        data: Prisma.ProblemCreateInput & {
            testCases?: Array<{
                input: string;
                output: string;
                isHidden?: boolean;
            }>;
            starterCode?: Array<{ language: Language; code: string }>;
        }
    ): Promise<ProblemWithRelations> {
        try {
            const { testCases = [], starterCode = [], ...problemData } = data;

            if (!problemData.slug && problemData.title) {
                problemData.slug = this.generateSlug(
                    problemData.title as string
                );
            }

            const problem = await this.prisma.problem.create({
                data: {
                    ...problemData,
                    testCases: {
                        create: testCases.map((tc) => ({
                            input: tc.input,
                            output: tc.output,
                            isHidden: tc.isHidden || false,
                        })),
                    },
                    starterCode: {
                        create: starterCode.map((sc) => ({
                            language: sc.language as Language,
                            code: sc.code,
                        })),
                    },
                },
                include: {
                    testCases: true,
                    starterCode: true,
                },
            });

            this.invalidateCache();

            return problem as ProblemWithRelations;
        } catch (error) {
            if ((error as any).code === "P2002") {
                throw new Error(
                    "A problem with this title or slug already exists"
                );
            }
            throw new Error(
                `Failed to create problem: ${(error as Error).message}`
            );
        }
    }

    async updateProblemWithRelations(
        id: string,
        data: Prisma.ProblemUpdateInput & {
            testCases?: Array<{
                input: string;
                output: string;
                isHidden?: boolean;
            }>;
            starterCode?: Array<{ language: Language; code: string }>;
        }
    ): Promise<ProblemWithRelations> {
        try {
            const { testCases, starterCode, ...problemData } = data;

            await this.prisma.problem.update({
                where: { id },
                data: problemData,
            });

            if (testCases) {
                await this.prisma.testCase.deleteMany({
                    where: { problemId: id },
                });

                await this.prisma.testCase.createMany({
                    data: testCases.map((tc) => ({
                        problemId: id,
                        input: tc.input,
                        output: tc.output,
                        isHidden: tc.isHidden || false,
                    })),
                });
            }

            if (starterCode) {
                await this.prisma.starterCode.deleteMany({
                    where: { problemId: id },
                });

                await this.prisma.starterCode.createMany({
                    data: starterCode.map((sc) => ({
                        problemId: id,
                        language: sc.language as Language,
                        code: sc.code,
                    })),
                });
            }

            this.invalidateCacheForId(id);

            return this.findProblemByIdentifier(
                id
            ) as Promise<ProblemWithRelations>;
        } catch (error) {
            if ((error as any).code === "P2025") {
                throw new Error("Problem not found");
            }
            throw new Error(
                `Failed to update problem: ${(error as Error).message}`
            );
        }
    }

    async deleteProblemWithRelations(id: string): Promise<void> {
        try {
            await this.prisma.testCase.deleteMany({
                where: { problemId: id },
            });

            await this.prisma.starterCode.deleteMany({
                where: { problemId: id },
            });

            await this.prisma.userProblem.deleteMany({
                where: { problemId: id },
            });

            await this.prisma.problem.delete({
                where: { id },
            });

            this.invalidateCacheForId(id);
        } catch (error) {
            if ((error as any).code === "P2025") {
                throw new Error("Problem not found");
            }
            throw new Error(
                `Failed to delete problem: ${(error as Error).message}`
            );
        }
    }

    async getProblemStatistics(): Promise<{
        total: number;
        easy: number;
        medium: number;
        hard: number;
    }> {
        try {
            const cacheKey = "problem:statistics";

            let result = this.cache.get(cacheKey);
            if (result) {
                return result as any;
            }

            const [totalProblems, difficultyStats] = await Promise.all([
                this.prisma.problem.count({ where: { isPublic: true } }),
                this.prisma.problem.groupBy({
                    by: ["difficulty"],
                    where: { isPublic: true },
                    _count: {
                        difficulty: true,
                    },
                }),
            ]);

            const stats = {
                total: totalProblems,
                easy:
                    difficultyStats.find((s) => s.difficulty === "EASY")?._count
                        .difficulty || 0,
                medium:
                    difficultyStats.find((s) => s.difficulty === "MEDIUM")
                        ?._count.difficulty || 0,
                hard:
                    difficultyStats.find((s) => s.difficulty === "HARD")?._count
                        .difficulty || 0,
            };

            this.cache.set(cacheKey, stats as any);
            return stats;
        } catch (error) {
            throw new Error(
                `Failed to get problem statistics: ${(error as Error).message}`
            );
        }
    }

    async getProblemForJudge(problemId: string): Promise<{
        id: string;
        title: string;
        timeLimit: number;
        memoryLimit: number;
        testCases: Array<{ input: string; output: string }>;
    } | null> {
        try {
            const problem = await this.prisma.problem.findUnique({
                where: { id: problemId },
                select: {
                    id: true,
                    title: true,
                    timeLimit: true,
                    memoryLimit: true,
                    testCases: {
                        select: {
                            input: true,
                            output: true,
                        },
                    },
                },
            });

            return problem;
        } catch (error) {
            throw new Error(
                `Failed to get problem for judge: ${(error as Error).message}`
            );
        }
    }

    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        try {
            const where: Prisma.ProblemWhereInput = { slug };
            if (excludeId) {
                where.id = { not: excludeId };
            }

            const problem = await this.prisma.problem.findFirst({
                where,
                select: { id: true },
            });

            return !!problem;
        } catch (error) {
            throw new Error(
                `Failed to check slug existence: ${(error as Error).message}`
            );
        }
    }

    async getProblemsByDifficulty(
        difficulty: Difficulty
    ): Promise<ProblemStats[]> {
        try {
            return (await this.prisma.problem.findMany({
                where: {
                    difficulty,
                    isPublic: true,
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    difficulty: true,
                    tags: true,
                    acceptanceRate: true,
                    totalSubmissions: true,
                    acceptedSubmissions: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            })) as ProblemStats[];
        } catch (error) {
            throw new Error(
                `Failed to get problems by difficulty: ${
                    (error as Error).message
                }`
            );
        }
    }

    async getProblemsByTags(tags: string[]): Promise<ProblemStats[]> {
        try {
            return (await this.prisma.problem.findMany({
                where: {
                    tags: {
                        hasEvery: tags,
                    },
                    isPublic: true,
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    difficulty: true,
                    tags: true,
                    acceptanceRate: true,
                    totalSubmissions: true,
                    acceptedSubmissions: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            })) as ProblemStats[];
        } catch (error) {
            throw new Error(
                `Failed to get problems by tags: ${(error as Error).message}`
            );
        }
    }

    async updateAcceptanceRate(problemId: string): Promise<void> {
        try {
            const submissionStats = await this.prisma.submission.groupBy({
                by: ["status"],
                where: { problemId },
                _count: {
                    status: true,
                },
            });

            const totalSubmissions = submissionStats.reduce(
                (acc, stat) => acc + stat._count.status,
                0
            );
            const acceptedSubmissions =
                submissionStats.find((stat) => stat.status === "ACCEPTED")
                    ?._count.status || 0;

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

            this.invalidateCacheForId(problemId);
        } catch (error) {
            throw new Error(
                `Failed to update acceptance rate: ${(error as Error).message}`
            );
        }
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }
}
