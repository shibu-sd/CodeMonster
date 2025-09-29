import React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Types for API responses
export interface Problem {
    id: string;
    slug: string;
    title: string;
    description: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    acceptance_rate: number;
    total_submissions: number;
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

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ProblemsResponse {
    problems: Problem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalProblems: number;
        limit: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

// API utility class
class ApiClient {
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
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error ||
                        `HTTP ${response.status}: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Problem-related API calls
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

    // Submission-related API calls
    async submitCode(data: {
        problemId: string;
        language: string;
        code: string;
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

    // Health check
    async healthCheck(): Promise<ApiResponse<any>> {
        return this.request<any>("/health");
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

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

    healthCheck: () => apiClient.healthCheck(),
    setAuthToken: (token: string) => apiClient.setAuthToken(token),
};

export const useApiWithAuth = () => {
    React.useEffect(() => {
        apiClient.setAuthToken("test-token");
    }, []);

    return api;
};

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
