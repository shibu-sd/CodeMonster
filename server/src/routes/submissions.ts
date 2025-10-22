import { Router } from "express";
import { SubmissionController } from "../controllers/submissionController";
import { authenticateUser, validateSubmission } from "../middleware/auth";
import { validate, commonSchemas } from "../middleware/validation";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
import { redisConnection } from "../queues/submissionQueue";

const router = Router();

router.post(
    "/",
    authenticateUser,
    rateLimitMiddleware.submission(redisConnection),
    validate(commonSchemas.submission),
    validateSubmission,
    SubmissionController.submitCode
);

router.post(
    "/run",
    authenticateUser,
    rateLimitMiddleware.runCode(redisConnection),
    validate(commonSchemas.submission),
    validateSubmission,
    SubmissionController.runCode
);

router.get(
    "/:id/status",
    authenticateUser,
    validate(commonSchemas.idParam),
    validate({
        query: [
            {
                field: "jobId",
                type: "string",
                minLength: 1,
                maxLength: 100,
            },
        ],
    }),
    SubmissionController.getSubmissionStatus
);

router.get(
    "/:id",
    authenticateUser,
    validate(commonSchemas.idParam),
    SubmissionController.getSubmission
);

router.get(
    "/problems/:problemId",
    authenticateUser,
    validate({
        params: [
            {
                field: "problemId",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: 50,
            },
        ],
        query: commonSchemas.pagination.query,
    }),
    SubmissionController.getProblemSubmissions
);

export { router as submissionRoutes };
