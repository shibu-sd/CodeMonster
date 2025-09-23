// Types and interfaces for our custom judge system

export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string | undefined;
    runtime: number; // in milliseconds
    memoryUsage: number; // in MB
    exitCode: number;
}

export interface TestCaseResult {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    runtime: number;
    memoryUsage: number;
    error?: string | undefined;
}

export interface JudgeResult {
    status:
        | "ACCEPTED"
        | "WRONG_ANSWER"
        | "TIME_LIMIT_EXCEEDED"
        | "MEMORY_LIMIT_EXCEEDED"
        | "RUNTIME_ERROR"
        | "COMPILATION_ERROR"
        | "INTERNAL_ERROR";
    testCasesPassed: number;
    totalTestCases: number;
    testCaseResults: TestCaseResult[];
    errorMessage?: string | undefined;
    totalRuntime: number;
    maxMemoryUsage: number;
}

export interface LanguageConfig {
    id: string;
    name: string;
    extension: string;
    dockerImage: string;
    compileCommand?: string;
    runCommand: string;
    timeLimit: number; // seconds
    memoryLimit: number; // MB
}

export interface CodeSubmission {
    id: string;
    code: string;
    language: string;
    problemId: string;
    userId: string;
    testCases: Array<{
        input: string;
        output: string;
    }>;
}

export interface DockerExecutionOptions {
    timeLimit: number;
    memoryLimit: number;
    networkDisabled: boolean;
    readOnlyRootfs: boolean;
    workingDir: string;
}

export enum SubmissionStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    ACCEPTED = "ACCEPTED",
    WRONG_ANSWER = "WRONG_ANSWER",
    TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
    MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED",
    RUNTIME_ERROR = "RUNTIME_ERROR",
    COMPILATION_ERROR = "COMPILATION_ERROR",
    SYSTEM_ERROR = "INTERNAL_ERROR",
}

// Job data for BullMQ
export interface JudgeJobData {
    submissionId: string;
    code: string;
    language: string;
    problemId: string;
    userId: string;
    testCases: Array<{
        input: string;
        output: string;
    }>;
}

export interface JudgeJobResult {
    submissionId: string;
    result: JudgeResult;
}
