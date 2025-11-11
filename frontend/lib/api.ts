import { apiClient } from "./api.client";

export const api = {
    getProblems: (params?: Parameters<typeof apiClient.getProblems>[0]) =>
        apiClient.getProblems(params),
    getProblem: (slug: string) => apiClient.getProblem(slug),
    getProblemStats: () => apiClient.getProblemStats(),

    submitCode: (data: Parameters<typeof apiClient.submitCode>[0]) =>
        apiClient.submitCode(data),
    runCode: (data: Parameters<typeof apiClient.runCode>[0]) =>
        apiClient.runCode(data),
    getSubmission: (id: string) => apiClient.getSubmission(id),
    getSubmissionStatus: (id: string, jobId?: string) =>
        apiClient.getSubmissionStatus(id, jobId),
    getSubmissionsByProblem: (problemId: string) =>
        apiClient.getSubmissionsByProblem(problemId),

    getUserDashboard: () => apiClient.getUserDashboard(),
    getUserSolution: (problemId: string) =>
        apiClient.getUserSolution(problemId),
    getUserContributionData: (year?: number) =>
        apiClient.getUserContributionData(year),

    getLeaderboard: (params?: Parameters<typeof apiClient.getLeaderboard>[0]) =>
        apiClient.getLeaderboard(params),
    searchLeaderboardUsers: (
        params: Parameters<typeof apiClient.searchLeaderboardUsers>[0]
    ) => apiClient.searchLeaderboardUsers(params),
    getLeaderboardStats: () => apiClient.getLeaderboardStats(),
    getUserRank: (userId?: string) => apiClient.getUserRank(userId),

    getUserBattles: (userId?: string) => apiClient.getUserBattles(userId),
    getBattle: (battleId: string) => apiClient.getBattle(battleId),

    healthCheck: () => apiClient.healthCheck(),
    setAuthToken: (token: string) => apiClient.setAuthToken(token),
};

export const useApiWithAuth = () => {
    return api;
};

export * from "./api.helpers";
export type {
    Problem,
    TestCase,
    StarterCode,
    ProblemStats,
    LeaderboardEntry,
    LeaderboardStats,
    ApiResponse,
    ProblemsResponse,
} from "@/types";
