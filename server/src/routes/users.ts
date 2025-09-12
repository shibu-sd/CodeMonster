import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.post("/sync", UserController.syncUserFromClerk);

router.get("/profile", authenticateUser, UserController.getCurrentUserProfile);

router.put("/profile", authenticateUser, UserController.updateUserProfile);

router.get("/:id/stats", UserController.getUserStats);

router.get(
    "/:id/submissions",
    authenticateUser,
    UserController.getUserSubmissions
);

router.get("/:id/progress", UserController.getUserProgress);

export { router as userRoutes };
