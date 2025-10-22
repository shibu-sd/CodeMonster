import { Request, Response } from "express";
import {
    NotFoundError,
    ConflictError,
    ValidationError,
    asyncHandler,
} from "../middleware/errorHandler";
import { ProblemFilters, PaginationQuery } from "../types";
import { Difficulty } from "@prisma/client";
import { problemRepository } from "../repositories";
import {
    createSuccessResponse,
    getPaginationParams,
    createPaginationResponse,
    generateSlug,
} from "../utils/helpers";
import { logger } from "../utils/logger";

export class ProblemController {
    static getAllProblems = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { difficulty, tags, search } = req.query as ProblemFilters;

            const pagination = getPaginationParams(
                req.query as PaginationQuery
            );

            logger.info("Fetching problems with filters", {
                difficulty,
                tags,
                search,
                pagination,
                userId: (req as any).user?.id,
            });

            const { problems, totalCount } =
                await problemRepository.findProblemsWithFilters(
                    { difficulty, tags, search } as ProblemFilters,
                    pagination
                );

            const paginatedResponse = createPaginationResponse(
                problems,
                totalCount,
                pagination.page,
                pagination.limit
            );

            logger.debug("Problems fetched successfully", {
                count: problems.length,
                totalCount,
            });

            const response = createSuccessResponse(paginatedResponse);
            res.status(200).json(response);
        }
    );

    static getProblemByIdentifier = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { identifier } = req.params;

            logger.info("Fetching problem by identifier", {
                identifier,
                userId: (req as any).user?.id,
            });

            const problem = await problemRepository.findProblemByIdentifier(
                identifier
            );

            if (!problem) {
                logger.warn("Problem not found", { identifier });
                throw new NotFoundError("Problem not found");
            }

            logger.debug("Problem fetched successfully", {
                problemId: problem.id,
                title: problem.title,
            });

            const response = createSuccessResponse(problem);
            res.status(200).json(response);
        }
    );

    static createProblem = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
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

            const parsedTimeLimit = parseInt(timeLimit.toString());
            const parsedMemoryLimit = parseInt(memoryLimit.toString());

            logger.info("Creating new problem", {
                title,
                difficulty,
                tagsCount: tags.length,
                testCasesCount: testCases.length,
                starterCodeCount: starterCode.length,
                userId: (req as any).user?.id,
            });

            if (!title || !description || !difficulty) {
                throw new ValidationError(
                    "Title, description, and difficulty are required"
                );
            }

            const slug = generateSlug(title);

            const slugExists = await problemRepository.slugExists(slug);
            if (slugExists) {
                logger.warn("Problem with this slug already exists", {
                    slug,
                    title,
                });
                throw new ConflictError(
                    "A problem with this title already exists"
                );
            }

            try {
                const problem =
                    await problemRepository.createProblemWithRelations({
                        title,
                        slug,
                        description,
                        difficulty: difficulty as Difficulty,
                        tags,
                        timeLimit: parsedTimeLimit,
                        memoryLimit: parsedMemoryLimit,
                        testCases,
                        starterCode,
                    });

                logger.info("Problem created successfully", {
                    problemId: problem.id,
                    title: problem.title,
                    slug: problem.slug,
                });

                const response = createSuccessResponse(
                    problem,
                    "Problem created successfully"
                );
                res.status(201).json(response);
            } catch (error: any) {
                if (error.message.includes("already exists")) {
                    throw new ConflictError(error.message);
                }
                throw error;
            }
        }
    );

    static updateProblem = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params;
            const updateData = req.body;

            logger.info("Updating problem", {
                problemId: id,
                updateFields: Object.keys(updateData),
                userId: (req as any).user?.id,
            });

            if (updateData.timeLimit !== undefined) {
                updateData.timeLimit = parseInt(
                    updateData.timeLimit.toString()
                );
            }
            if (updateData.memoryLimit !== undefined) {
                updateData.memoryLimit = parseInt(
                    updateData.memoryLimit.toString()
                );
            }

            delete updateData.id;
            delete updateData.slug;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            try {
                const problem =
                    await problemRepository.updateProblemWithRelations(
                        id,
                        updateData
                    );

                logger.info("Problem updated successfully", {
                    problemId: id,
                    title: problem.title,
                });

                const response = createSuccessResponse(
                    problem,
                    "Problem updated successfully"
                );
                res.status(200).json(response);
            } catch (error: any) {
                if (error.message.includes("not found")) {
                    throw new NotFoundError("Problem not found");
                }
                throw error;
            }
        }
    );

    static deleteProblem = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params;

            logger.info("Deleting problem", {
                problemId: id,
                userId: (req as any).user?.id,
            });

            try {
                await problemRepository.deleteProblemWithRelations(id);

                logger.info("Problem deleted successfully", { problemId: id });

                const response = createSuccessResponse(
                    null,
                    "Problem deleted successfully"
                );
                res.status(200).json(response);
            } catch (error: any) {
                if (error.message.includes("not found")) {
                    throw new NotFoundError("Problem not found");
                }
                throw error;
            }
        }
    );

    static getProblemsStats = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            logger.info("Fetching problem statistics", {
                userId: (req as any).user?.id,
            });

            const stats = await problemRepository.getProblemStatistics();

            logger.debug("Problem statistics fetched", stats);

            const response = createSuccessResponse(stats);
            res.status(200).json(response);
        }
    );
}
