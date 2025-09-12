import { Router } from "express";
import { SubmissionController } from "../controllers/submissionController";
import {
    authenticateUser,
    validateSubmission,
    submissionRateLimit,
} from "../middleware/auth";

const router = Router();

router.post(
    "/",
    authenticateUser,
    validateSubmission,
    submissionRateLimit,
    SubmissionController.submitCode
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
