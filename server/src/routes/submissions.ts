import { Router } from "express";
import { SubmissionController } from "../controllers/submissionController";
import {
    authenticateUser,
    validateSubmission,
    submissionRateLimit,
    runCodeRateLimit,
} from "../middleware/auth";

const router = Router();

router.post(
    "/",
    authenticateUser,
    validateSubmission,
    submissionRateLimit,
    SubmissionController.submitCode
);

router.post(
    "/run",
    authenticateUser,
    validateSubmission,
    runCodeRateLimit,
    SubmissionController.runCode
);

router.get(
    "/:id/status",
    authenticateUser,
    SubmissionController.getSubmissionStatus
);

router.get("/:id", authenticateUser, SubmissionController.getSubmission);

router.get(
    "/problems/:problemId",
    authenticateUser,
    SubmissionController.getProblemSubmissions
);

export { router as submissionRoutes };
