import type {
    Problem,
    ProblemStats,
    ApiResponse,
    ProblemsResponse,
    LeaderboardResponse,
    LeaderboardStats,
    UserRankResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiClient {
    private baseUrl: string;
    private authToken: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setAuthToken(token: string) {
        this.authToken = token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...((options.headers as Record<string, string>) || {}),
        };

        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`;
        }

        try {
            console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);

            const response = await fetch(url, {
                ...options,
                headers,
            });

            console.log(
                `📡 API Response: ${response.status} ${response.statusText}`
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage =
                    errorData.error ||
                    `HTTP ${response.status}: ${response.statusText}`;
                console.error(`❌ API Error: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            if (
                error instanceof TypeError &&
                error.message === "Failed to fetch"
            ) {
                console.error(
                    `❌ Network Error: Cannot connect to ${this.baseUrl}`
                );
                console.error(
                    `   Is the server running? Check: ${this.baseUrl}/health`
                );
                throw new Error(
                    `Cannot connect to server at ${this.baseUrl}. Make sure the server is running.`
                );
            }
            console.error(`❌ API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    async getProblems(params?: {
        page?: number;
        limit?: number;
        difficulty?: string;
        search?: string;
    }): Promise<ApiResponse<ProblemsResponse>> {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
            searchParams.append("limit", params.limit.toString());
        if (params?.difficulty)
            searchParams.append("difficulty", params.difficulty);
        if (params?.search) searchParams.append("search", params.search);

        const query = searchParams.toString();
        const endpoint = `/api/problems${query ? `?${query}` : ""}`;

        return this.request<ProblemsResponse>(endpoint);
    }

    async getProblem(slug: string): Promise<ApiResponse<Problem>> {
        return this.request<Problem>(`/api/problems/${slug}`);
    }

    async getProblemStats(): Promise<ApiResponse<ProblemStats>> {
        return this.request<ProblemStats>("/api/problems/stats");
    }

    async submitCode(data: {
        problemId: string;
        language: string;
        code: string;
        battleId?: string;
    }): Promise<
        ApiResponse<{
            submissionId: string;
            jobId: string;
            status: string;
            message: string;
        }>
    > {
        return this.request<{
            submissionId: string;
            jobId: string;
            status: string;
            message: string;
        }>("/api/submissions", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async runCode(data: {
        problemId: string;
        language: string;
        code: string;
        battleId?: string;
    }): Promise<ApiResponse<any>> {
        return this.request<any>("/api/submissions/run", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getSubmission(submissionId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/api/submissions/${submissionId}`);
    }

    async getSubmissionStatus(
        submissionId: string,
        jobId?: string
    ): Promise<ApiResponse<any>> {
        const query = jobId ? `?jobId=${jobId}` : "";
        return this.request<any>(
            `/api/submissions/${submissionId}/status${query}`
        );
    }

    async getSubmissionsByProblem(
        problemId: string
    ): Promise<ApiResponse<any[]>> {
        return this.request<any[]>(`/api/submissions/problem/${problemId}`);
    }

    async healthCheck(): Promise<ApiResponse<any>> {
        return this.request<any>("/health");
    }

    async getUserDashboard(): Promise<ApiResponse<any>> {
        return this.request("/api/users/dashboard");
    }

    async getUserSolution(problemId: string): Promise<ApiResponse<any>> {
        return this.request(`/api/users/solutions/${problemId}`);
    }

    async getUserContributionData(year?: number): Promise<ApiResponse<any[]>> {
        const query = year ? `?year=${year}` : "";
        return this.request(`/api/users/contributions${query}`);
    }

    async getLeaderboard(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<ApiResponse<LeaderboardResponse["data"]>> {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
            searchParams.append("limit", params.limit.toString());
        if (params?.search) searchParams.append("search", params.search);

        const query = searchParams.toString();
        const endpoint = `/api/leaderboard${query ? `?${query}` : ""}`;

        return this.request<LeaderboardResponse["data"]>(endpoint);
    }

    async searchLeaderboardUsers(params: {
        query: string;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<LeaderboardResponse["data"]>> {
        const searchParams = new URLSearchParams();

        searchParams.append("q", params.query);
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
            searchParams.append("limit", params.limit.toString());

        return this.request<LeaderboardResponse["data"]>(
            `/api/leaderboard/search?${searchParams.toString()}`
        );
    }

    async getLeaderboardStats(): Promise<ApiResponse<LeaderboardStats>> {
        return this.request<LeaderboardStats>("/api/leaderboard/stats");
    }

    async getUserRank(
        userId?: string
    ): Promise<ApiResponse<UserRankResponse["data"]>> {
        const endpoint = userId
            ? `/api/leaderboard/rank/${userId}`
            : "/api/leaderboard/rank";
        return this.request<UserRankResponse["data"]>(endpoint);
    }

    async getUserBattles(userId?: string): Promise<ApiResponse<any>> {
        const endpoint = userId
            ? `/api/battles?userId=${userId}`
            : "/api/battles";
        return this.request<any>(endpoint);
    }

    async getBattle(battleId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/api/battles/${battleId}`);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
