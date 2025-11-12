export interface TestCaseResult {
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtime?: number;
}

export interface RunResult {
    status: string;
    testCaseResults?: TestCaseResult[];
    totalRuntime?: number;
    maxMemoryUsage?: number;
    testCasesPassed?: number;
    totalTestCases?: number;
    error?: string;
    message?: string;
}

export interface SubmissionResult {
    id?: string;
    status: string;
    testCaseResults?: TestCaseResult[];
    testCasesPassed?: number;
    totalTestCases?: number;
    runtime?: number;
    memoryUsage?: number;
    error?: string;
    progress?: number;
    currentTestCase?: number | null;
    message?: string;
}

export interface BattleNotification {
    id: string;
    message: string;
    type: "run" | "submit" | "message";
    timestamp: number;
    avatarUrl?: string;
    username?: string;
}

export interface AcceptedSolution {
    code: string;
    language: string;
    runtime: number;
    memory: number;
    solvedAt: string;
}
