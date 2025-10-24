import { Router } from "express";
import { LeaderboardController } from "../controllers/leaderboardController";
import { authenticateUser, optionalAuth } from "../middleware/auth";
import { validate, commonSchemas } from "../middleware/validation";

const router = Router();
const leaderboardController = new LeaderboardController();

router.get(
    "/",
    optionalAuth,
    validate({
        query: [
            {
                field: "page",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num > 0;
                },
            },
            {
                field: "limit",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num > 0 && num <= 100;
                },
            },
            {
                field: "search",
                type: "string",
                maxLength: 100,
            },
        ],
    }),
    leaderboardController.getLeaderboard
);

router.get(
    "/search",
    validate({
        query: [
            {
                field: "q",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: 100,
            },
            {
                field: "page",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num > 0;
                },
            },
            {
                field: "limit",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num > 0 && num <= 50;
                },
            },
        ],
    }),
    leaderboardController.searchUsers
);

router.get("/stats", leaderboardController.getLeaderboardStats);

router.get(
    "/rank/:userId",
    validate({
        params: [
            {
                field: "userId",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: 50,
            },
        ],
    }),
    leaderboardController.getUserRank
);

router.get("/rank", authenticateUser, leaderboardController.getUserRank);

export default router;
