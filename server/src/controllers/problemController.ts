import { Request, Response } from "express";
import { prisma } from "../utils/database";
import { ApiResponse, ProblemFilters, PaginationQuery } from "../types";
import { Difficulty } from "@prisma/client";

export class ProblemController {
    static async getAllProblems(req: Request, res: Response): Promise<void> {
        try {
            const {
                page = 1,
                limit = 20,
                difficulty,
                tags,
                search,
                sortBy = "createdAt",
                sortOrder = "desc",
            } = req.query as PaginationQuery & ProblemFilters;

            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            const where: any = {
                isPublic: true,
            };

            if (difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
                where.difficulty = difficulty;
            }

            if (tags && Array.isArray(tags)) {
                where.tags = {
                    hasEvery: tags,
                };
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }

            const [problems, totalCount] = await Promise.all([
                prisma.problem.findMany({
                    where,
                    skip,
                    take,
                    orderBy: {
                        [sortBy]: sortOrder,
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
                prisma.problem.count({ where }),
            ]);

            const response: ApiResponse = {
                success: true,
                data: {
                    problems,
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
            console.error("Error fetching problems:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch problems",
            });
        }
    }

    static async getProblemByIdentifier(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { identifier } = req.params;

            const problem = await prisma.problem.findFirst({
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
                    _count: {
                        select: {
                            submissions: true,
                        },
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

            const response: ApiResponse = {
                success: true,
                data: problem,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching problem:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch problem",
            });
        }
    }

    static async createProblem(req: Request, res: Response): Promise<void> {
        try {
            const {
                title,
                description,
                difficulty,
                tags = [],
                timeLimit = 2000,
                memoryLimit = 128,
                testCases = [],
                starterCode = [],
            } = req.body;

            if (!title || !description || !difficulty) {
                res.status(400).json({
                    success: false,
                    error: "Title, description, and difficulty are required",
                });
                return;
            }

            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .trim();

            const existingProblem = await prisma.problem.findUnique({
                where: { slug },
            });

            if (existingProblem) {
                res.status(409).json({
                    success: false,
                    error: "A problem with this title already exists",
                });
                return;
            }

            const problem = await prisma.problem.create({
                data: {
                    title,
                    slug,
                    description,
                    difficulty: difficulty as Difficulty,
                    tags,
                    timeLimit,
                    memoryLimit,
                    testCases: {
                        create: testCases.map((tc: any) => ({
                            input: tc.input,
                            output: tc.output,
                            isHidden: tc.isHidden || false,
                        })),
                    },
                    starterCode: {
                        create: starterCode.map((sc: any) => ({
                            language: sc.language,
                            code: sc.code,
                        })),
                    },
                },
                include: {
                    testCases: true,
                    starterCode: true,
                },
            });

            const response: ApiResponse = {
                success: true,
                data: problem,
                message: "Problem created successfully",
            };

            res.status(201).json(response);
        } catch (error) {
            console.error("Error creating problem:", error);
            res.status(500).json({
                success: false,
                error: "Failed to create problem",
            });
        }
    }

    static async updateProblem(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            delete updateData.id;
            delete updateData.slug;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const problem = await prisma.problem.update({
                where: { id },
                data: updateData,
                include: {
                    testCases: true,
                    starterCode: true,
                },
            });

            const response: ApiResponse = {
                success: true,
                data: problem,
                message: "Problem updated successfully",
            };

            res.status(200).json(response);
        } catch (error) {
            if ((error as any).code === "P2025") {
                res.status(404).json({
                    success: false,
                    error: "Problem not found",
                });
                return;
            }

            console.error("Error updating problem:", error);
            res.status(500).json({
                success: false,
                error: "Failed to update problem",
            });
        }
    }

    static async deleteProblem(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            await prisma.problem.delete({
                where: { id },
            });

            const response: ApiResponse = {
                success: true,
                message: "Problem deleted successfully",
            };

            res.status(200).json(response);
        } catch (error) {
            if ((error as any).code === "P2025") {
                res.status(404).json({
                    success: false,
                    error: "Problem not found",
                });
                return;
            }

            console.error("Error deleting problem:", error);
            res.status(500).json({
                success: false,
                error: "Failed to delete problem",
            });
        }
    }

    static async getProblemsStats(req: Request, res: Response): Promise<void> {
        try {
            const [totalProblems, difficultyStats] = await Promise.all([
                prisma.problem.count({ where: { isPublic: true } }),
                prisma.problem.groupBy({
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

            const response: ApiResponse = {
                success: true,
                data: stats,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching problem stats:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch problem statistics",
            });
        }
    }
}
