import { Router } from "express";
import { ProblemController } from "../controllers/problemController";
import {
    authenticateUser,
    requireAdmin,
    optionalAuth,
} from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, ProblemController.getAllProblems);

router.get("/stats", ProblemController.getProblemsStats);

router.get(
    "/:identifier",
    optionalAuth,
    ProblemController.getProblemByIdentifier
);

router.post(
    "/",
    authenticateUser,
    requireAdmin,
    ProblemController.createProblem
);

router.put(
    "/:id",
    authenticateUser,
    requireAdmin,
    ProblemController.updateProblem
);

router.delete(
    "/:id",
    authenticateUser,
    requireAdmin,
    ProblemController.deleteProblem
);

export { router as problemRoutes };
