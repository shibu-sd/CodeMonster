// Leaderboard type definitions

export interface LeaderboardEntry {
    rank: number;
    id: string;
    username: string | null;
    profileImageUrl: string | null;
    problemsSolved: number;
    acceptedSubmissions: number;
    totalSubmissions: number;
    acceptanceRate: number;
    createdAt: Date;
    isCurrentUser?: boolean;
}

export interface LeaderboardStats {
    totalUsers: number;
    totalProblemsSolved: number;
    averageProblemsSolved: number;
    topUserProblemsSolved: number;
    activeUsersThisMonth: number;
}

export interface LeaderboardResponse {
    success: boolean;
    data: {
        users: LeaderboardEntry[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        stats?: LeaderboardStats;
    };
    message?: string;
}

export interface UserRankResponse {
    success: boolean;
    data: {
        user: LeaderboardEntry;
        rank: number;
        percentile: number;
    };
}

export interface LeaderboardQueryParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface LeaderboardQueryResult {
    id: string;
    username: string | null;
    profileImageUrl: string | null;
    problemsSolved: number;
    acceptedSubmissions: number;
    totalSubmissions: number;
    createdAt: Date;
    acceptanceRate: number;
    rank: bigint;
}
