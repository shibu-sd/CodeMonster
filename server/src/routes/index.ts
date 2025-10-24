import { Router } from "express";
import { problemRoutes } from "./problems";
import { userRoutes } from "./users";
import { submissionRoutes } from "./submissions";
import { judgeRoutes } from "./judge";
import leaderboardRoutes from "./leaderboard";

const router = Router();

router.use("/problems", problemRoutes);
router.use("/users", userRoutes);
router.use("/submissions", submissionRoutes);
router.use("/judge", judgeRoutes);
router.use("/leaderboard", leaderboardRoutes);

router.get("/", (_req, res) => {
    res.json({
        message: "CodeMonster API Server",
        version: "1.0.0",
        endpoints: {
            problems: {
                "GET /api/problems": "Get all problems",
                "GET /api/problems/:id": "Get problem by ID or slug",
                "GET /api/problems/stats": "Get problems statistics",
                "POST /api/problems": "Create problem (admin only)",
                "PUT /api/problems/:id": "Update problem (admin only)",
                "DELETE /api/problems/:id": "Delete problem (admin only)",
            },
            users: {
                "POST /api/users/sync": "Sync user from Clerk",
                "GET /api/users/profile": "Get current user profile",
                "PUT /api/users/profile": "Update user profile",
                "GET /api/users/:id/stats": "Get user statistics",
                "GET /api/users/:id/submissions": "Get user submissions",
                "GET /api/users/:id/progress": "Get user progress",
            },
            submissions: {
                "POST /api/submissions": "Submit code for a problem",
                "GET /api/submissions/:id": "Get submission details",
                "GET /api/submissions/:id/status": "Get submission status",
                "GET /api/problems/:problemId/submissions":
                    "Get submissions for a problem",
            },
            leaderboard: {
                "GET /api/leaderboard": "Get main leaderboard with pagination",
                "GET /api/leaderboard/search": "Search users by username",
                "GET /api/leaderboard/stats":
                    "Get global leaderboard statistics",
                "GET /api/leaderboard/rank":
                    "Get current user's rank (auth required)",
                "GET /api/leaderboard/rank/:userId": "Get specific user's rank",
            },
        },
        documentation: "https://docs.codemonster.dev",
    });
});

export { router as apiRoutes };
