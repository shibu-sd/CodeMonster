import type { Problem } from "@/types";

export const getDifficultyColor = (difficulty: Problem["difficulty"]) => {
    switch (difficulty) {
        case "EASY":
            return "text-green-600 dark:text-green-400";
        case "MEDIUM":
            return "text-yellow-600 dark:text-yellow-400";
        case "HARD":
            return "text-red-600 dark:text-red-400";
        default:
            return "text-gray-600 dark:text-gray-400";
    }
};

export const getDifficultyBadgeColor = (difficulty: Problem["difficulty"]) => {
    switch (difficulty) {
        case "EASY":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "HARD":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
};

export const formatAcceptanceRate = (
    rate: number | undefined | null
): string => {
    if (rate === undefined || rate === null || isNaN(rate)) {
        return "0.0%";
    }
    return `${(rate * 100).toFixed(1)}%`;
};

export const formatSubmissionCount = (
    count: number | undefined | null
): string => {
    if (count === undefined || count === null || isNaN(count)) {
        return "0";
    }

    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
};
