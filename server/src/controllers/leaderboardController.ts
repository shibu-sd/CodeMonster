import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import {
    LeaderboardResponse,
    LeaderboardEntry,
    LeaderboardStats,
    UserRankResponse,
} from "../types/leaderboard.types";
import { asyncHandler } from "../middleware/errorHandler";

export class LeaderboardController {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit as string) || 50)
        );
        const search = (req.query.search as string) || "";

        try {
            const result = await this.userRepository.getLeaderboard({
                page,
                limit,
                timeFrame: "all",
            });

            let filteredUsers = result.users;
            if (search) {
                filteredUsers = result.users.filter((user) => {
                    const searchableName = (
                        user.user.username ||
                        user.user.firstName ||
                        ""
                    ).toLowerCase();
                    return searchableName.includes(search.toLowerCase());
                });
            }

            const leaderboardEntries: LeaderboardEntry[] = filteredUsers.map(
                (user, index) => ({
                    rank: user.rank,
                    id: user.user.id,
                    username: user.user.username,
                    firstName: user.user.firstName,
                    profileImageUrl: user.user.profileImageUrl,
                    problemsSolved: Number(user.user.problemsSolved),
                    battlesWon: Number(user.user.battlesWon || 0),
                    acceptedSubmissions: Number(user.user.acceptedSubmissions),
                    totalSubmissions: Number(user.user.totalSubmissions),
                    acceptanceRate: Number(user.stats.acceptanceRate || 0),
                    createdAt: new Date(user.user.createdAt),
                    isCurrentUser: req.user?.id === user.user.id,
                })
            );

            const response: LeaderboardResponse = {
                success: true,
                data: {
                    users: leaderboardEntries,
                    pagination: {
                        page,
                        limit,
                        total: result.totalCount,
                        totalPages: Math.ceil(result.totalCount / limit),
                        hasNext: page < Math.ceil(result.totalCount / limit),
                        hasPrev: page > 1,
                    },
                },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getLeaderboard:", error);
            res.status(500).json({
                success: false,
                error: "Failed to load leaderboard data",
            });
        }
    });

    searchUsers = asyncHandler(async (req: Request, res: Response) => {
        const query = (req.query.q as string) || "";
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit as string) || 20)
        );

        if (query.length < 2) {
            return res.status(400).json({
                success: false,
                error: "Search query must be at least 2 characters long",
            });
        }

        try {
            const result = await this.userRepository.getLeaderboard({
                page: 1,
                limit: 1000, // Get many users to search through
                timeFrame: "all",
            });

            const searchResults = result.users.filter((user) =>
                user.user.username?.toLowerCase().includes(query.toLowerCase())
            );

            const startIndex = (page - 1) * limit;
            const paginatedResults = searchResults.slice(
                startIndex,
                startIndex + limit
            );

            const leaderboardEntries: LeaderboardEntry[] = paginatedResults.map(
                (user) => ({
                    rank: 0, // Not computing rank for search results
                    id: user.user.id,
                    username: user.user.username,
                    firstName: user.user.firstName,
                    profileImageUrl: user.user.profileImageUrl,
                    problemsSolved: Number(user.user.problemsSolved),
                    battlesWon: Number(user.user.battlesWon || 0),
                    acceptedSubmissions: Number(user.user.acceptedSubmissions),
                    totalSubmissions: Number(user.user.totalSubmissions),
                    acceptanceRate: Number(user.stats.acceptanceRate || 0),
                    createdAt: new Date(user.user.createdAt),
                    isCurrentUser: req.user?.id === user.user.id,
                })
            );

            res.status(200).json({
                success: true,
                data: {
                    users: leaderboardEntries,
                    pagination: {
                        page,
                        limit,
                        total: searchResults.length,
                        totalPages: Math.ceil(searchResults.length / limit),
                        hasNext: page < Math.ceil(searchResults.length / limit),
                        hasPrev: page > 1,
                    },
                },
            });
        } catch (error) {
            console.error("Error in searchUsers:", error);
            res.status(500).json({
                success: false,
                error: "Failed to search users",
            });
        }
    });

    getUserRank = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "User ID is required",
            });
        }

        try {
            const result = await this.userRepository.getLeaderboard({
                page: 1,
                limit: 1000, // Get many users to find rank
                timeFrame: "all",
            });

            const userIndex = result.users.findIndex(
                (u) => u.user.id === userId
            );

            if (userIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: "User not found or hasn't solved any problems",
                });
            }

            const user = result.users[userIndex];
            const leaderboardEntry: LeaderboardEntry = {
                rank: user.rank,
                id: user.user.id,
                username: user.user.username,
                firstName: user.user.firstName,
                profileImageUrl: user.user.profileImageUrl,
                problemsSolved: Number(user.user.problemsSolved),
                battlesWon: Number(user.user.battlesWon || 0),
                acceptedSubmissions: Number(user.user.acceptedSubmissions),
                totalSubmissions: Number(user.user.totalSubmissions),
                acceptanceRate: Number(user.stats.acceptanceRate || 0),
                createdAt: new Date(user.user.createdAt),
                isCurrentUser: req.user?.id === user.user.id,
            };

            const percentile =
                result.totalCount > 0
                    ? ((result.totalCount - user.rank + 1) /
                          result.totalCount) *
                      100
                    : 0;

            const response: UserRankResponse = {
                success: true,
                data: {
                    user: leaderboardEntry,
                    rank: user.rank,
                    percentile: Math.round(percentile * 100) / 100,
                },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getUserRank:", error);
            res.status(500).json({
                success: false,
                error: "Failed to get user rank",
            });
        }
    });

    getLeaderboardStats = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.userRepository.getLeaderboard({
                page: 1,
                limit: 1000, // Get all users for stats
                timeFrame: "all",
            });

            const users = result.users;

            const totalUsers = result.totalCount;
            const totalProblemsSolved = users.reduce(
                (sum, user) => sum + Number(user.user.problemsSolved),
                0
            );
            const averageProblemsSolved =
                totalUsers > 0
                    ? Math.round(totalProblemsSolved / totalUsers)
                    : 0;
            const topUserProblemsSolved =
                users.length > 0
                    ? Math.max(
                          ...users.map((u) => Number(u.user.problemsSolved))
                      )
                    : 0;

            const activeUsersThisMonth = 0;

            const stats: LeaderboardStats = {
                totalUsers,
                totalProblemsSolved,
                averageProblemsSolved,
                topUserProblemsSolved,
                activeUsersThisMonth,
            };

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error("Error in getLeaderboardStats:", error);
            res.status(500).json({
                success: false,
                error: "Failed to load leaderboard statistics",
            });
        }
    });
}
