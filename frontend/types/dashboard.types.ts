export interface DashboardData {
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImageUrl: string;
        problemsSolved: number;
        battlesWon: number;
        totalSubmissions: number;
        acceptedSubmissions: number;
        acceptanceRate: number;
        createdAt: string;
    };
    solvedProblems: Array<{
        id: string;
        problemId: string;
        title: string;
        slug: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        tags: string[];
        solvedAt: string;
        acceptedLanguage: string;
        acceptedRuntime: number;
        acceptedMemory: number;
    }>;
    recentSubmissions: Array<{
        id: string;
        problemId: string;
        problemTitle: string;
        problemSlug: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        language: string;
        status: string;
        runtime: number;
        memoryUsage: number;
        submittedAt: string;
        completedAt: string;
    }>;
    stats: {
        difficultyBreakdown: {
            easy: number;
            medium: number;
            hard: number;
        };
        topTags: Array<{
            tag: string;
            count: number;
        }>;
        submissionHistory: any[];
    };
}
