import type { LeaderboardEntry, LeaderboardStats } from "./api.types";

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface LeaderboardTableProps {
    users: LeaderboardEntry[];
    isLoading?: boolean;
    pagination?: PaginationInfo;
    onNextPage?: () => void;
    onPrevPage?: () => void;
}

export interface LeaderboardStatsProps {
    stats: LeaderboardStats;
    isLoading?: boolean;
}
