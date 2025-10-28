import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.post("/sync", UserController.syncUserFromClerk);

router.get("/profile", authenticateUser, UserController.getCurrentUserProfile);
router.put("/profile", authenticateUser, UserController.updateUserProfile);

router.get("/dashboard", authenticateUser, UserController.getUserDashboard);

router.get(
    "/solutions/:problemId",
    authenticateUser,
    UserController.getUserSolution
);

router.get(
    "/contributions",
    authenticateUser,
    UserController.getUserContributionData
);

router.get("/:id/stats", UserController.getUserStats);
router.get("/:id/progress", UserController.getUserProgress);

router.get(
    "/:id/submissions",
    authenticateUser,
    UserController.getUserSubmissions
);

export { router as userRoutes };
