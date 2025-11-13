import { Button } from "@/components/ui/button";
import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
    TestTube,
    Code,
    X,
    MoreHorizontal,
    CheckCircle,
    XCircle,
} from "lucide-react";

interface TestCaseResult {
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtime?: number;
}

interface RunResult {
    status: string;
    testCaseResults?: TestCaseResult[];
    totalRuntime?: number;
    maxMemoryUsage?: number;
    testCasesPassed?: number;
    totalTestCases?: number;
    error?: string;
}

interface SubmissionResult {
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
}

interface ResultsPanelProps {
    showRunPanel: boolean;
    showSubmitPanel: boolean;
    runResult: RunResult | null;
    submissionResult: SubmissionResult | null;
    activeTestCase: number;
    onTestCaseChange: (index: number) => void;
    onClose: () => void;
    pollingAttempts: number;
}

export function ResultsPanel({
    showRunPanel,
    showSubmitPanel,
    runResult,
    submissionResult,
    activeTestCase,
    onTestCaseChange,
    onClose,
    pollingAttempts,
}: ResultsPanelProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "WRONG_ANSWER":
            case "RUNTIME_ERROR":
            case "COMPILATION_ERROR":
            case "ERROR":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "TIME_LIMIT_EXCEEDED":
            case "MEMORY_LIMIT_EXCEEDED":
                return <XCircle className="h-5 w-5 text-yellow-500" />;
            case "PENDING":
            case "RUNNING":
                return (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                );
            default:
                return (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return "text-green-600 dark:text-green-400";
            case "WRONG_ANSWER":
            case "RUNTIME_ERROR":
            case "COMPILATION_ERROR":
            case "ERROR":
                return "text-red-600 dark:text-red-400";
            case "TIME_LIMIT_EXCEEDED":
            case "MEMORY_LIMIT_EXCEEDED":
                return "text-yellow-600 dark:text-yellow-400";
            case "PENDING":
            case "RUNNING":
                return "text-blue-600 dark:text-blue-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    };

    if (!showRunPanel && !showSubmitPanel) return null;

    return (
        <>
            <div className="relative">
                <ResizableHandle />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="bg-background border border-border rounded-sm px-1 shadow-sm">
                        <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                    </div>
                </div>
            </div>

            <ResizablePanel defaultSize={40} minSize={20} maxSize={70}>
                <div className="bg-card border-t rounded-t-lg h-full flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            {showSubmitPanel ? (
                                <>
                                    <Code className="h-4 w-4" />
                                    <span className="font-medium">
                                        Submission Results
                                    </span>
                                    {submissionResult?.id && (
                                        <span className="text-xs text-muted-foreground">
                                            ID: {submissionResult.id.slice(-8)}
                                        </span>
                                    )}
                                </>
                            ) : showRunPanel ? (
                                <>
                                    <TestTube className="h-4 w-4" />
                                    <span className="font-medium">
                                        Test Results
                                    </span>
                                </>
                            ) : null}
                        </div>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-8 w-8"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] [&::-webkit-scrollbar-thumb]:rounded dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f] [&::-webkit-scrollbar-thumb:hover]:bg-[#525252]">
                        {showRunPanel && !showSubmitPanel && runResult && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(runResult.status)}
                                        <span
                                            className={`font-semibold ${getStatusColor(
                                                runResult.status
                                            )}`}
                                        >
                                            {runResult.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    {runResult.testCasesPassed !==
                                        undefined && (
                                        <div className="text-sm">
                                            <span
                                                className={`font-medium ${
                                                    runResult.testCasesPassed ===
                                                    runResult.totalTestCases
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {runResult.testCasesPassed}/
                                                {runResult.totalTestCases}{" "}
                                                passed
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {runResult.testCaseResults &&
                                    runResult.testCaseResults.length > 0 && (
                                        <div>
                                            <div className="flex space-x-1 mb-3 border-b">
                                                {runResult.testCaseResults.map(
                                                    (
                                                        testCase: TestCaseResult,
                                                        index: number
                                                    ) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                onTestCaseChange(
                                                                    index
                                                                )
                                                            }
                                                            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                                                                activeTestCase ===
                                                                index
                                                                    ? "border-primary text-primary"
                                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                                            }`}
                                                        >
                                                            {testCase.passed ? (
                                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3 text-red-500" />
                                                            )}
                                                            <span>
                                                                Case {index + 1}
                                                            </span>
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            {runResult.testCaseResults[
                                                activeTestCase
                                            ] && (
                                                <div className="bg-muted/30 rounded-lg p-4">
                                                    <div className="space-y-3 text-sm">
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                Input:
                                                            </span>
                                                            <div className="mt-1 p-2 bg-background rounded border font-mono text-xs">
                                                                {
                                                                    runResult
                                                                        .testCaseResults[
                                                                        activeTestCase
                                                                    ].input
                                                                }
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                Expected Output:
                                                            </span>
                                                            <div className="mt-1 p-2 bg-background rounded border font-mono text-xs">
                                                                {
                                                                    runResult
                                                                        .testCaseResults[
                                                                        activeTestCase
                                                                    ]
                                                                        .expectedOutput
                                                                }
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                Your Output:
                                                            </span>
                                                            <div
                                                                className={`mt-1 p-2 rounded border font-mono text-xs ${
                                                                    runResult
                                                                        .testCaseResults[
                                                                        activeTestCase
                                                                    ].passed
                                                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                                                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                                                }`}
                                                            >
                                                                {
                                                                    runResult
                                                                        .testCaseResults[
                                                                        activeTestCase
                                                                    ]
                                                                        .actualOutput
                                                                }
                                                            </div>
                                                        </div>
                                                        {runResult
                                                            .testCaseResults[
                                                            activeTestCase
                                                        ].runtime && (
                                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                                <span>
                                                                    Runtime:{" "}
                                                                    {
                                                                        runResult
                                                                            .testCaseResults[
                                                                            activeTestCase
                                                                        ]
                                                                            .runtime
                                                                    }{" "}
                                                                    ms
                                                                </span>
                                                                <span
                                                                    className={
                                                                        runResult
                                                                            .testCaseResults[
                                                                            activeTestCase
                                                                        ].passed
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                    }
                                                                >
                                                                    {runResult
                                                                        .testCaseResults[
                                                                        activeTestCase
                                                                    ].passed
                                                                        ? "Passed"
                                                                        : "Failed"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {runResult.error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                                        <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                                            {runResult.error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {showSubmitPanel &&
                            !showRunPanel &&
                            submissionResult && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(
                                                submissionResult.status
                                            )}
                                            <div>
                                                <span
                                                    className={`font-semibold text-lg ${getStatusColor(
                                                        submissionResult.status
                                                    )}`}
                                                >
                                                    {submissionResult.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                                {(submissionResult.status ===
                                                    "PENDING" ||
                                                    submissionResult.status ===
                                                        "RUNNING") && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {submissionResult.status ===
                                                        "PENDING"
                                                            ? `Queued... (${Math.floor(
                                                                  pollingAttempts /
                                                                      5 +
                                                                      1
                                                              )}/10)`
                                                            : submissionResult.currentTestCase
                                                            ? `Running test case ${
                                                                  submissionResult.currentTestCase
                                                              }/${
                                                                  submissionResult.totalTestCases ||
                                                                  5
                                                              }...`
                                                            : "Executing your code..."}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {submissionResult.testCasesPassed !==
                                            undefined && (
                                            <div className="text-right">
                                                <div
                                                    className={`font-bold ${
                                                        submissionResult.status ===
                                                        "ACCEPTED"
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {
                                                        submissionResult.testCasesPassed
                                                    }
                                                    /
                                                    {
                                                        submissionResult.totalTestCases
                                                    }{" "}
                                                    passed
                                                </div>
                                                <div className="w-32 bg-muted rounded-full h-2 mt-1">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-1000 ${
                                                            submissionResult.status ===
                                                            "ACCEPTED"
                                                                ? "bg-green-500"
                                                                : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${
                                                                ((submissionResult.testCasesPassed ||
                                                                    0) /
                                                                    (submissionResult.totalTestCases ||
                                                                        1)) *
                                                                100
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {submissionResult.status === "ACCEPTED" && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="font-semibold text-green-800 dark:text-green-200">
                                                    Accepted! 🎉
                                                </span>
                                            </div>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                                Your solution passed all test
                                                cases! Great job solving this
                                                problem.
                                            </p>
                                        </div>
                                    )}

                                    {(submissionResult.status === "ACCEPTED" ||
                                        submissionResult.runtime) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {submissionResult.runtime &&
                                                submissionResult.runtime >
                                                    0 && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                                        <div className="text-xs text-muted-foreground mb-1">
                                                            Runtime
                                                        </div>
                                                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                            {
                                                                submissionResult.runtime
                                                            }{" "}
                                                            ms
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {submissionResult.runtime <
                                                            100
                                                                ? "⚡ Excellent"
                                                                : submissionResult.runtime <
                                                                  500
                                                                ? "✅ Good"
                                                                : submissionResult.runtime <
                                                                  1000
                                                                ? "⚠️ Average"
                                                                : "🐌 Slow"}
                                                        </div>
                                                    </div>
                                                )}
                                            {submissionResult.memoryUsage &&
                                                submissionResult.memoryUsage >
                                                    0 && (
                                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                                                        <div className="text-xs text-muted-foreground mb-1">
                                                            Memory
                                                        </div>
                                                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                            {
                                                                submissionResult.memoryUsage
                                                            }{" "}
                                                            MB
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {submissionResult.memoryUsage <
                                                            50
                                                                ? "🔥 Efficient"
                                                                : submissionResult.memoryUsage <
                                                                  100
                                                                ? "✅ Good"
                                                                : "📈 High"}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {submissionResult.error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span className="font-medium text-red-800 dark:text-red-200">
                                                    Error Details
                                                </span>
                                            </div>
                                            <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                                                {submissionResult.error}
                                            </pre>
                                        </div>
                                    )}

                                    {submissionResult.status !== "ACCEPTED" &&
                                        submissionResult.status !== "PENDING" &&
                                        submissionResult.status !== "RUNNING" &&
                                        !submissionResult.error && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                <div className="flex items-center space-x-2">
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                    <span className="font-semibold text-red-800 dark:text-red-200">
                                                        {submissionResult.status.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                                                    Your solution didn't pass
                                                    all test cases. Try
                                                    debugging your code and
                                                    submit again.
                                                </p>
                                            </div>
                                        )}
                                </div>
                            )}
                    </div>
                </div>
            </ResizablePanel>
        </>
    );
}
