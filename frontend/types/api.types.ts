export interface Problem {
    id: string;
    slug: string;
    title: string;
    description: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    acceptanceRate: number;
    totalSubmissions: number;
    acceptedSubmissions?: number;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    testCases?: TestCase[];
    starterCode?: StarterCode[];
}

export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface StarterCode {
    id: string;
    language: "JAVASCRIPT" | "PYTHON" | "JAVA" | "CPP" | "TYPESCRIPT";
    code: string;
}

export interface ProblemStats {
    total: number;
    easy: number;
    medium: number;
    hard: number;
}

export interface LeaderboardEntry {
    rank: number;
    id: string;
    username: string | null;
    firstName: string | null;
    profileImageUrl: string | null;
    problemsSolved: number;
    battlesWon: number;
    acceptedSubmissions: number;
    totalSubmissions: number;
    acceptanceRate: number;
    createdAt: string;
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
}

export interface UserRankResponse {
    success: boolean;
    data: {
        user: LeaderboardEntry;
        rank: number;
        percentile: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ProblemsResponse {
    data: Problem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
