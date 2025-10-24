"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { HeroHeader } from "@/components/header/header";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@clerk/nextjs";
import {
    ResizablePanelGroup,
    ResizablePanel,
} from "@/components/ui/resizable";
import {
    useApiWithAuth,
    Problem,
} from "@/lib/api";
import { ProblemDetailSkeleton } from "./components/ProblemDetailSkeleton";
import { ProblemHeader } from "./components/ProblemHeader";
import { ProblemContentTabs } from "./components/ProblemContentTabs";
import { CodeEditorPanel } from "./components/CodeEditorPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { ProblemErrorState } from "./components/ProblemErrorState";

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
    const [showSkeleton, setShowSkeleton] = useState(true);
    const skeletonStartTime = useRef<number>(Date.now());
    const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
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

    // Handle skeleton display - simplified logic
    useEffect(() => {
        if (!loading) {
            const elapsedTime = Date.now() - skeletonStartTime.current;
            const minimumDisplayTime = 500; // 0.5 second minimum

            if (elapsedTime < minimumDisplayTime) {
                const remainingTime = minimumDisplayTime - elapsedTime;
                const timer = setTimeout(() => {
                    setShowSkeleton(false);
                    if (!hasInitiallyLoaded) {
                        setHasInitiallyLoaded(true);
                    }
                }, remainingTime);

                return () => clearTimeout(timer);
            } else {
                setShowSkeleton(false);
                if (!hasInitiallyLoaded) {
                    setHasInitiallyLoaded(true);
                }
            }
        }
    }, [loading, hasInitiallyLoaded]);

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

    if (showSkeleton || loading) {
        return (
            <div className="h-screen bg-background flex flex-col overflow-hidden">
                <HeroHeader />
                <main className="flex-1 w-full px-6 pt-10 pb-6 flex flex-col overflow-hidden">
                    <ProblemDetailSkeleton />
                </main>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <ProblemErrorState
                    error={error}
                    onGoBack={() => router.back()}
                />
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <HeroHeader />

            <main className="flex-1 w-full px-6 pt-10 pb-6 flex flex-col overflow-hidden">
                <ProblemHeader problem={problem} />

                {/* Split Layout - Fixed left/right panels */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Problem Content - Fixed 50% width */}
                    <div className="w-1/2 flex flex-col h-full overflow-hidden pr-3">
                        <ProblemContentTabs
                            problem={problem}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            acceptedSolution={acceptedSolution}
                            onCodeLoad={(code, language) => {
                                setCode(code);
                                setSelectedLanguage(language);
                                setActiveTab("description");
                            }}
                        />
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
                                <CodeEditorPanel
                                    selectedLanguage={selectedLanguage}
                                    code={code}
                                    onLanguageChange={handleLanguageChange}
                                    onCodeChange={setCode}
                                    onCodeReset={handleCodeReset}
                                    onRunCode={handleRunCode}
                                    onSubmitCode={handleSubmitCode}
                                    isSubmitting={isSubmitting}
                                    isRunning={isRunning}
                                    availableLanguages={availableLanguages}
                                />
                            </ResizablePanel>

                            <ResultsPanel
                            showRunPanel={showRunPanel}
                            showSubmitPanel={showSubmitPanel}
                            runResult={runResult}
                            submissionResult={submissionResult}
                            activeTestCase={activeTestCase}
                            onTestCaseChange={setActiveTestCase}
                            onClose={closeResultPanel}
                            pollingAttempts={pollingAttempts}
                        />
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
