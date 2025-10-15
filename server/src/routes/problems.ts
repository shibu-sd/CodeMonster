import { Router } from "express";
import { ProblemController } from "../controllers/problemController";
import {
    authenticateUser,
    requireAdmin,
    optionalAuth,
} from "../middleware/auth";
import { validate, commonSchemas } from "../middleware/validation";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { redisConnection } from "../queues/submissionQueue";

const router = Router();

router.get(
    "/",
    optionalAuth,
    validate({
        query: [
            ...commonSchemas.pagination.query,
            ...commonSchemas.problemFilters.query,
        ],
    }),
    ProblemController.getAllProblems
);

router.get("/stats", ProblemController.getProblemsStats);

router.get(
    "/:identifier",
    optionalAuth,
    validate({
        params: [
            {
                field: "identifier",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: 50,
            },
        ],
    }),
    ProblemController.getProblemByIdentifier
);

router.post(
    "/",
    rateLimitMiddleware.admin(redisConnection),
    authenticateUser,
    requireAdmin,
    validate(commonSchemas.createProblem),
    ProblemController.createProblem
);

router.put(
    "/:id",
    rateLimitMiddleware.admin(redisConnection),
    authenticateUser,
    requireAdmin,
    validate({
        params: commonSchemas.idParam.params,
        body: [
            {
                field: "title",
                type: "string",
                minLength: 1,
                maxLength: 200,
                pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
            },
            {
                field: "description",
                type: "string",
                minLength: 10,
                maxLength: 10000,
            },
            {
                field: "difficulty",
                type: "string",
                enum: ["EASY", "MEDIUM", "HARD"],
            },
            {
                field: "tags",
                type: "array",
                custom: (value: any) => {
                    if (!Array.isArray(value)) return false;
                    return value.every(
                        (tag) =>
                            typeof tag === "string" &&
                            tag.length >= 1 &&
                            tag.length <= 50 &&
                            /^[a-z0-9\-]+$/.test(tag)
                    );
                },
            },
            {
                field: "timeLimit",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num >= 500 && num <= 10000;
                },
            },
            {
                field: "memoryLimit",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num >= 64 && num <= 1024;
                },
            },
        ],
    }),
    ProblemController.updateProblem
);

router.delete(
    "/:id",
    rateLimitMiddleware.admin(redisConnection),
    authenticateUser,
    requireAdmin,
    validate(commonSchemas.idParam),
    ProblemController.deleteProblem
);

export { router as problemRoutes };
