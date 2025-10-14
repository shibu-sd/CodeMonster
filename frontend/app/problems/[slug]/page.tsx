"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Play,
    BookOpen,
    TestTube,
    Code,
    CheckCircle,
    XCircle,
    RotateCcw,
    Settings,
    Star,
    X,
    MoreHorizontal,
} from "lucide-react";
import { HeroHeader } from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@clerk/nextjs";
import { MonacoEditor } from "@/components/code-editor/monaco-editor";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { marked } from "marked";
import {
    useApiWithAuth,
    Problem,
    getDifficultyBadgeColor,
    formatAcceptanceRate,
    formatSubmissionCount,
} from "@/lib/api";

marked.setOptions({
    breaks: true,
    gfm: true,
});

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

function ProblemDetailPageContent() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "description" | "submissions" | "editorial"
    >("description");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("PYTHON");
    const [code, setCode] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [submissionResult, setSubmissionResult] =
        useState<SubmissionResult | null>(null);
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [currentSubmissionId, setCurrentSubmissionId] = useState<
        string | null
    >(null);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [pollingAttempts, setPollingAttempts] = useState<number>(0);
    const [acceptedSolution, setAcceptedSolution] = useState<{
        code: string;
        language: string;
        runtime: number;
        memory: number;
        solvedAt: string;
    } | null>(null);

    // Pop-up window states
    const [showRunPanel, setShowRunPanel] = useState(false);
    const [showSubmitPanel, setShowSubmitPanel] = useState(false);
    const [activeTestCase, setActiveTestCase] = useState(0);

    const availableLanguages = [
        { id: "PYTHON", name: "Python", extension: "py" },
        { id: "JAVA", name: "Java", extension: "java" },
        { id: "CPP", name: "C++", extension: "cpp" },
    ];

    useEffect(() => {
        const initAuth = async () => {
            if (isLoaded && isSignedIn) {
                try {
                    const token = await getToken();
                    if (token) {
                        api.setAuthToken(token);
                        setAuthReady(true);
                    }
                } catch (err) {
                    console.error("Failed to get token:", err);
                }
            } else if (isLoaded && !isSignedIn) {
                setAuthReady(true);
            }
        };

        initAuth();
    }, [isLoaded, isSignedIn]);

    useEffect(() => {
        if (slug && authReady) {
            fetchProblem();
        }
    }, [slug, authReady]);

    // Load starter code when problem is loaded
    useEffect(() => {
        if (problem) {
            const starterCode = getStarterCodeForLanguage(selectedLanguage);
            setCode(starterCode);
        }
    }, [problem, selectedLanguage]);

    useEffect(() => {
        if (problem && authReady && isSignedIn) {
            loadAcceptedSolution();
        }
    }, [problem, authReady, isSignedIn]);

    const loadAcceptedSolution = async () => {
        if (!problem || !isSignedIn) return;

        try {
            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

            const response = await api.getUserSolution(problem.id);
            if (response.success && response.data) {
                setAcceptedSolution({
                    code: response.data.acceptedSolution || "",
                    language: response.data.acceptedLanguage || "PYTHON",
                    runtime: response.data.acceptedRuntime || 0,
                    memory: response.data.acceptedMemory || 0,
                    solvedAt: response.data.solvedAt || "",
                });
            }
        } catch (error) {
            // User hasn't solved this problem yet - that's ok
            console.log("No accepted solution found");
        }
    };

    const fetchProblem = async () => {
        try {
            setLoading(true);
            const response = await api.getProblem(slug);

            if (response.success) {
                setProblem(response.data);
                if (
                    response.data.starterCode &&
                    response.data.starterCode.length > 0
                ) {
                    setSelectedLanguage(response.data.starterCode[0].language);
                }
            } else {
                setError("Problem not found");
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch problem"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRunCode = async () => {
        console.log("🚀 Run button clicked!");
        if (!problem) {
            console.error("❌ No problem found!");
            return;
        }

        if (!isSignedIn) {
            console.error("❌ User not signed in!");
            setRunResult({
                status: "ERROR",
                error: "Please sign in to run code",
            });
            return;
        }

        console.log(`🔧 Running code for problem: ${problem.id}`);
        console.log(`📝 Language: ${selectedLanguage}`);
        console.log(`💻 Code length: ${code.length} characters`);

        try {
            setIsRunning(true);
            setRunResult({ status: "RUNNING" });
            setShowRunPanel(true);
            setShowSubmitPanel(false);
            setActiveTestCase(0);

            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

            const response = await api.runCode({
                problemId: problem.id,
                language: selectedLanguage,
                code: code,
            });

            console.log("📊 Run API response:", response);

            if (response.success && response.data) {
                setRunResult({
                    status: response.data.status || "ERROR",
                    testCaseResults: response.data.testCaseResults || [],
                    totalRuntime: response.data.totalRuntime || 0,
                    maxMemoryUsage: response.data.maxMemoryUsage || 0,
                    testCasesPassed: response.data.testCasesPassed || 0,
                    totalTestCases: response.data.totalTestCases || 0,
                });
            } else {
                setRunResult({
                    status: "ERROR",
                    error: response?.message || "Run failed",
                });
            }
        } catch (err) {
            setRunResult({
                status: "ERROR",
                error: err instanceof Error ? err.message : "Run failed",
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        console.log("📤 Submit button clicked!");
        if (!problem) {
            console.error("❌ No problem found!");
            return;
        }

        if (!isSignedIn) {
            console.error("❌ User not signed in!");
            setSubmissionResult({
                status: "ERROR",
                error: "Please sign in to submit code",
            });
            return;
        }

        console.log(`🔧 Submitting code for problem: ${problem.id}`);
        console.log(`📝 Language: ${selectedLanguage}`);
        console.log(`💻 Code length: ${code.length} characters`);

        try {
            setIsSubmitting(true);
            setSubmissionResult({ status: "PENDING" });
            setShowSubmitPanel(true);
            setShowRunPanel(false);
            setActiveTestCase(0);
            setPollingAttempts(0);

            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

            const response = await api.submitCode({
                problemId: problem.id,
                language: selectedLanguage,
                code: code,
            });

            console.log("📊 Submit API response:", response);

            if (response.success && response.data) {
                setCurrentSubmissionId(response.data.submissionId);
                setCurrentJobId(response.data.jobId);
                setSubmissionResult({
                    id: response.data.submissionId,
                    status: "PENDING",
                });

                // Start polling for results
                pollSubmissionResult(
                    response.data.submissionId,
                    response.data.jobId
                );
            } else {
                setSubmissionResult({
                    status: "ERROR",
                    error: response?.message || "Submission failed",
                });
                setIsSubmitting(false);
            }
        } catch (err) {
            setSubmissionResult({
                status: "ERROR",
                error: err instanceof Error ? err.message : "Submission failed",
            });
            setIsSubmitting(false);
        }
    };

    const pollSubmissionResult = async (
        submissionId: string,
        jobId: string
    ) => {
        const maxAttempts = 60;
        let attempts = 0;
        setPollingAttempts(0);

        const poll = async () => {
            try {
                attempts++;
                setPollingAttempts(attempts);
                console.log(
                    `🔍 Polling attempt ${attempts} for submission ${submissionId}`
                );

                const response = await api.getSubmissionStatus(
                    submissionId,
                    jobId
                );

                if (response.success && response.data) {
                    const status = response.data.status;
                    console.log(`📊 Submission status: ${status}`);

                    setSubmissionResult({
                        id: submissionId,
                        status: status,
                        testCasesPassed: response.data.testCasesPassed || 0,
                        totalTestCases: response.data.totalTestCases || 0,
                        runtime: response.data.runtime || 0,
                        memoryUsage: response.data.memoryUsage || 0,
                        error: response.data.errorMessage || null,
                        progress: response.data.progress || 0,
                        currentTestCase: attempts <= 5 ? attempts : null,
                        testCaseResults: response.data.testCaseResults || [],
                    });

                    if (
                        status === "PENDING" ||
                        status === "RUNNING" ||
                        status === "PROCESSING"
                    ) {
                        if (attempts < maxAttempts) {
                            setTimeout(poll, 1000);
                        } else {
                            setSubmissionResult(
                                (prev: SubmissionResult | null) => ({
                                    ...(prev || {}),
                                    status: "TIMEOUT",
                                    error: "Submission timed out",
                                })
                            );
                            setIsSubmitting(false);
                        }
                    } else {
                        console.log(`🎉 Final result: ${status}`);
                        setIsSubmitting(false);

                        if (status === "ACCEPTED") {
                            await loadAcceptedSolution();
                            setActiveTab("submissions");
                        }
                    }
                } else {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 2000);
                    } else {
                        setSubmissionResult(
                            (prev: SubmissionResult | null) => ({
                                ...(prev || {}),
                                status: "ERROR",
                                error: "Failed to get submission status",
                            })
                        );
                        setIsSubmitting(false);
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
                if (attempts < maxAttempts) {
                    setTimeout(poll, 2000);
                } else {
                    setSubmissionResult((prev: SubmissionResult | null) => ({
                        ...(prev || {}),
                        status: "ERROR",
                        error: "Failed to get submission status",
                    }));
                    setIsSubmitting(false);
                }
            }
        };

        poll();
    };

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

    const getStarterCodeForLanguage = (language: string) => {
        if (!problem?.starterCode) return "";
        const starterCode = problem.starterCode.find(
            (sc) => sc.language === language
        );
        return starterCode?.code || "";
    };

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage);
        const starterCode = getStarterCodeForLanguage(newLanguage);
        setCode(starterCode);
    };

    const handleCodeReset = () => {
        const starterCode = getStarterCodeForLanguage(selectedLanguage);
        setCode(starterCode);
    };

    const closeResultPanel = () => {
        setShowRunPanel(false);
        setShowSubmitPanel(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">
                                Loading problem...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-red-500 mb-4 text-6xl">❌</div>
                            <h2 className="text-2xl font-bold mb-2">
                                Problem Not Found
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {error}
                            </p>
                            <div className="space-x-4">
                                <Button onClick={() => router.back()}>
                                    Go Back
                                </Button>
                                <Link href="/problems">
                                    <Button variant="outline">
                                        View All Problems
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <HeroHeader />

            <main className="flex-1 w-full px-6 pt-10 pb-6 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="mb-3 px-2">
                    <div className="flex items-center mb-4">
                        <Link href="/problems">
                            <Button variant="ghost" size="sm" className="mr-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Problems
                            </Button>
                        </Link>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">
                            {problem.title}
                        </h1>
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-4">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                                        problem.difficulty
                                    )}`}
                                >
                                    {problem.difficulty}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Acceptance Rate:{" "}
                                    {formatAcceptanceRate(
                                        problem?.acceptanceRate
                                    )}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Submissions:{" "}
                                    {formatSubmissionCount(
                                        problem?.totalSubmissions
                                    )}
                                </span>
                            </div>

                            {/* Tags */}
                            {problem.tags && problem.tags.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    {problem.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Split Layout - Fixed left/right panels */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Problem Content - Fixed 50% width */}
                    <div className="w-1/2 flex flex-col h-full overflow-hidden pr-3">
                        {/* Custom Tabs */}
                        <div className="flex flex-col h-full">
                            {/* Tabs Header */}
                            <div className="flex justify-between items-center border-b mb-3 flex-shrink-0">
                                <div className="flex">
                                    <button
                                        onClick={() =>
                                            setActiveTab("description")
                                        }
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                            activeTab === "description"
                                                ? "border-primary text-primary"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Description
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveTab("submissions")
                                        }
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                            activeTab === "submissions"
                                                ? "border-primary text-primary"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <Code className="h-4 w-4" />
                                        Submissions
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveTab("editorial")
                                        }
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                            activeTab === "editorial"
                                                ? "border-primary text-primary"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <TestTube className="h-4 w-4" />
                                        Editorial
                                    </button>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="p-2"
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="p-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tab Content - Scrollable with custom scrollbar */}
                            <div className="flex-1 overflow-hidden">
                                <div className="h-full overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f]">
                                    {activeTab === "description" && (
                                        <div className="space-y-6 pb-6">
                                            <div className="bg-card rounded-lg p-6 border">
                                                <div
                                                    className="prose prose-sm max-w-none dark:prose-invert 
                                                        [&>p]:mb-4 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base
                                                        [&>strong]:font-semibold [&>strong]:text-foreground
                                                        [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-md [&>pre]:border
                                                        [&>code]:bg-muted [&>code]:px-2 [&>code]:py-1 [&>code]:rounded
                                                        [&>ul]:pl-6 [&>ol]:pl-6 [&>li]:mb-2
                                                        [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4"
                                                    dangerouslySetInnerHTML={{
                                                        __html: marked(
                                                            problem.description
                                                        ),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "submissions" && (
                                        <div className="space-y-4">
                                            {acceptedSolution ? (
                                                <div className="bg-card rounded-lg p-6 border">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                            Your Accepted
                                                            Solution
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Code className="h-4 w-4" />
                                                                {
                                                                    acceptedSolution.language
                                                                }
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                ⚡{" "}
                                                                {
                                                                    acceptedSolution.runtime
                                                                }
                                                                ms
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                💾{" "}
                                                                {
                                                                    acceptedSolution.memory
                                                                }
                                                                MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3 text-sm text-muted-foreground">
                                                        Solved on{" "}
                                                        {new Date(
                                                            acceptedSolution.solvedAt
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                                                        <pre className="text-sm">
                                                            <code>
                                                                {
                                                                    acceptedSolution.code
                                                                }
                                                            </code>
                                                        </pre>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-4"
                                                        onClick={() => {
                                                            setCode(
                                                                acceptedSolution.code
                                                            );
                                                            setSelectedLanguage(
                                                                acceptedSolution.language
                                                            );
                                                            setActiveTab(
                                                                "description"
                                                            );
                                                        }}
                                                    >
                                                        Load in Editor
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="bg-card rounded-lg p-6 border">
                                                    <h3 className="text-lg font-semibold mb-4">
                                                        Your Submissions
                                                    </h3>
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <Code className="h-12 w-12 mx-auto mb-4" />
                                                        <p>
                                                            No accepted solution
                                                            yet
                                                        </p>
                                                        <p className="text-sm">
                                                            Submit your solution
                                                            to see it here
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "editorial" && (
                                        <div className="bg-card rounded-lg p-6 border">
                                            <h3 className="text-lg font-semibold mb-4">
                                                Editorial
                                            </h3>
                                            <div className="text-center py-8 text-muted-foreground">
                                                <BookOpen className="h-12 w-12 mx-auto mb-4" />
                                                <p>Editorial coming soon</p>
                                                <p className="text-sm">
                                                    Detailed solution
                                                    explanation will be
                                                    available here
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Code Editor and Results - Fixed 50% width */}
                    <div className="w-1/2 flex flex-col h-full pl-3">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="h-full"
                        >
                            {/* Code Editor Panel */}
                            <ResizablePanel
                                defaultSize={
                                    showRunPanel || showSubmitPanel ? 60 : 100
                                }
                                minSize={30}
                            >
                                <div className="flex flex-col h-full space-y-3">
                                    {/* Editor Header */}
                                    <div className="flex items-center justify-between bg-card rounded-lg p-3 border flex-shrink-0">
                                        <div className="flex items-center space-x-4">
                                            <label className="text-sm font-medium">
                                                Language:
                                            </label>
                                            <select
                                                value={selectedLanguage}
                                                onChange={(e) =>
                                                    handleLanguageChange(
                                                        e.target.value
                                                    )
                                                }
                                                className="px-3 py-1 border border-border rounded-md bg-background text-sm"
                                                disabled={isSubmitting}
                                            >
                                                {availableLanguages.map(
                                                    (lang) => (
                                                        <option
                                                            key={lang.id}
                                                            value={lang.id}
                                                        >
                                                            {lang.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCodeReset}
                                                disabled={isSubmitting}
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRunCode}
                                                disabled={
                                                    isSubmitting ||
                                                    isRunning ||
                                                    !code.trim()
                                                }
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                {isRunning
                                                    ? "Running..."
                                                    : "Run"}
                                            </Button>

                                            <Button
                                                size="sm"
                                                onClick={handleSubmitCode}
                                                disabled={
                                                    isSubmitting ||
                                                    isRunning ||
                                                    !code.trim()
                                                }
                                            >
                                                {isSubmitting
                                                    ? "Submitting..."
                                                    : "Submit"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Monaco Code Editor - Full Height */}
                                    <div className="bg-card rounded-lg border overflow-hidden flex-1">
                                        <MonacoEditor
                                            value={code}
                                            onChange={setCode}
                                            language={selectedLanguage}
                                            height="100%"
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>

                            {/* Results Panel (only shown when there are results) */}
                            {(showRunPanel || showSubmitPanel) && (
                                <>
                                    <div className="relative">
                                        <ResizableHandle />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                            <div className="bg-background border border-border rounded-sm px-1 shadow-sm">
                                                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>

                                    <ResizablePanel
                                        defaultSize={40}
                                        minSize={20}
                                        maxSize={70}
                                    >
                                        <div className="bg-card border-t rounded-t-lg h-full flex flex-col">
                                            {/* Panel Header */}
                                            <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg flex-shrink-0">
                                                <div className="flex items-center space-x-2">
                                                    {showRunPanel && (
                                                        <>
                                                            <TestTube className="h-4 w-4" />
                                                            <span className="font-medium">
                                                                Test Results
                                                            </span>
                                                        </>
                                                    )}
                                                    {showSubmitPanel && (
                                                        <>
                                                            <Code className="h-4 w-4" />
                                                            <span className="font-medium">
                                                                Submission
                                                                Results
                                                            </span>
                                                            {submissionResult?.id && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    ID:{" "}
                                                                    {submissionResult.id.slice(
                                                                        -8
                                                                    )}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="p-1 h-8 w-8"
                                                        onClick={
                                                            closeResultPanel
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Panel Content */}
                                            <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] [&::-webkit-scrollbar-thumb]:rounded dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f] [&::-webkit-scrollbar-thumb:hover]:bg-[#525252]">
                                                {/* Run Results */}
                                                {showRunPanel && runResult && (
                                                    <div className="space-y-4">
                                                        {/* Status and Summary */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                {getStatusIcon(
                                                                    runResult.status
                                                                )}
                                                                <span
                                                                    className={`font-semibold ${getStatusColor(
                                                                        runResult.status
                                                                    )}`}
                                                                >
                                                                    {runResult.status.replace(
                                                                        "_",
                                                                        " "
                                                                    )}
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
                                                                        {
                                                                            runResult.testCasesPassed
                                                                        }
                                                                        /
                                                                        {
                                                                            runResult.totalTestCases
                                                                        }{" "}
                                                                        passed
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Test Case Tabs */}
                                                        {runResult.testCaseResults &&
                                                            runResult
                                                                .testCaseResults
                                                                .length > 0 && (
                                                                <div>
                                                                    <div className="flex space-x-1 mb-3 border-b">
                                                                        {runResult.testCaseResults.map(
                                                                            (
                                                                                testCase: TestCaseResult,
                                                                                index: number
                                                                            ) => (
                                                                                <button
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    onClick={() =>
                                                                                        setActiveTestCase(
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
                                                                                        Case{" "}
                                                                                        {index +
                                                                                            1}
                                                                                    </span>
                                                                                </button>
                                                                            )
                                                                        )}
                                                                    </div>

                                                                    {/* Active Test Case Content */}
                                                                    {runResult
                                                                        .testCaseResults[
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
                                                                                            ]
                                                                                                .input
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-medium text-muted-foreground">
                                                                                        Expected
                                                                                        Output:
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
                                                                                        Your
                                                                                        Output:
                                                                                    </span>
                                                                                    <div
                                                                                        className={`mt-1 p-2 rounded border font-mono text-xs ${
                                                                                            runResult
                                                                                                .testCaseResults[
                                                                                                activeTestCase
                                                                                            ]
                                                                                                .passed
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
                                                                                ]
                                                                                    .runtime && (
                                                                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                                                        <span>
                                                                                            Runtime:{" "}
                                                                                            {
                                                                                                runResult
                                                                                                    .testCaseResults[
                                                                                                    activeTestCase
                                                                                                ]
                                                                                                    .runtime
                                                                                            }
                                                                                            ms
                                                                                        </span>
                                                                                        <span
                                                                                            className={
                                                                                                runResult
                                                                                                    .testCaseResults[
                                                                                                    activeTestCase
                                                                                                ]
                                                                                                    .passed
                                                                                                    ? "text-green-600"
                                                                                                    : "text-red-600"
                                                                                            }
                                                                                        >
                                                                                            {runResult
                                                                                                .testCaseResults[
                                                                                                activeTestCase
                                                                                            ]
                                                                                                .passed
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
                                                                    {
                                                                        runResult.error
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Submit Results - Simplified */}
                                                {showSubmitPanel &&
                                                    submissionResult && (
                                                        <div className="space-y-4">
                                                            {/* Status Display with Progress */}
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

                                                            {/* Performance Metrics */}
                                                            {(submissionResult.status ===
                                                                "ACCEPTED" ||
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
                                                                                    }
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
                                                                                    }
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

                                                            {/* Success Message */}
                                                            {submissionResult.status ===
                                                                "ACCEPTED" && (
                                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                                        <span className="font-semibold text-green-800 dark:text-green-200">
                                                                            Accepted!
                                                                            🎉
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                                                        Your
                                                                        solution
                                                                        passed
                                                                        all test
                                                                        cases!
                                                                        Great
                                                                        job
                                                                        solving
                                                                        this
                                                                        problem.
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Error Message */}
                                                            {submissionResult.error && (
                                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                                        <span className="font-medium text-red-800 dark:text-red-200">
                                                                            Error
                                                                            Details
                                                                        </span>
                                                                    </div>
                                                                    <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                                                                        {
                                                                            submissionResult.error
                                                                        }
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {/* Simple failure message for non-accepted submissions */}
                                                            {submissionResult.status !==
                                                                "ACCEPTED" &&
                                                                submissionResult.status !==
                                                                    "PENDING" &&
                                                                submissionResult.status !==
                                                                    "RUNNING" &&
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
                                                                            Your
                                                                            solution
                                                                            didn't
                                                                            pass
                                                                            all
                                                                            test
                                                                            cases.
                                                                            Try
                                                                            debugging
                                                                            your
                                                                            code
                                                                            and
                                                                            submit
                                                                            again.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                </>
                            )}
                        </ResizablePanelGroup>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProblemDetailPage() {
    return (
        <ProtectedPage
            fallbackTitle="Authentication Required"
            fallbackMessage="You need to sign in to access this problem."
        >
            <ProblemDetailPageContent />
        </ProtectedPage>
    );
}
