"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { HeroHeader } from "@/components/header/header";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth, useUser } from "@clerk/nextjs";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { useApiWithAuth, Problem } from "@/lib/api";
import { ProblemDetailSkeleton } from "./components/ProblemDetailSkeleton";
import { ProblemHeader } from "./components/ProblemHeader";
import { ProblemContentTabs } from "./components/ProblemContentTabs";
import { CodeEditorPanel } from "./components/CodeEditorPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { ProblemErrorState } from "./components/ProblemErrorState";
import { useBattle } from "@/contexts/BattleContext";
import { BattleEndDialog } from "@/components/battle/BattleEndDialog";
import { BattleChatBox } from "@/components/battle/BattleChatBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    message?: string;
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
    message?: string;
}

function ProblemDetailPageContent() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const {
        battleState,
        runCode: runBattleCode,
        submitCode: submitBattleCode,
        forfeitBattle,
        sendMessage,
        clearBattleState,
    } = useBattle();

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

    // Battle mode state
    const [battleNotifications, setBattleNotifications] = useState<
        Array<{
            id: string;
            message: string;
            type: "run" | "submit" | "message";
            timestamp: number;
            avatarUrl?: string;
            username?: string;
        }>
    >([]);
    const [showBattleEndDialog, setShowBattleEndDialog] = useState(false);
    const [battleEndData, setBattleEndData] = useState<{
        isWinner: boolean;
        isDraw: boolean;
        opponentName?: string;
    } | null>(null);

    // Get battle start time from persisted state
    const battleStartTime = battleState.currentBattle?.startTime
        ? new Date(battleState.currentBattle.startTime)
        : null;

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

    // Handle battle end
    useEffect(() => {
        if (battleState.currentBattle?.status === "finished") {
            const winnerId = battleState.currentBattle.winnerId;
            const opponentId = battleState.currentBattle.opponent?.id;
            const opponentName = battleState.currentBattle.opponent?.username;

            // Debug logging
            console.log("🏆 Battle finished - Winner detection:", {
                winnerId,
                opponentId,
                winnerIdType: typeof winnerId,
                opponentIdType: typeof opponentId,
                opponentMatch: winnerId === opponentId,
            });

            const isDraw = !winnerId;
            const isWinner = Boolean(
                winnerId && opponentId && winnerId !== opponentId
            );

            console.log("🏆 Final determination:", { isWinner, isDraw });

            setBattleEndData({
                isWinner,
                isDraw,
                opponentName,
            });
            setShowBattleEndDialog(true);
        }
    }, [
        battleState.currentBattle?.status,
        battleState.currentBattle?.winnerId,
        battleState.currentBattle?.opponent,
    ]);

    // Handle battle end dialog close
    const handleBattleEndDialogClose = () => {
        setShowBattleEndDialog(false);
        clearBattleState();
    };

    // Listen for opponent actions in battle
    useEffect(() => {
        if (!battleState.currentBattle) {
            return;
        }

        const handleOpponentAction = (event: any) => {
            const { type, userId, result } = event.detail;

            // Only show notification if the userId is the OPPONENT's ID, not our own
            if (battleState.currentBattle?.opponent?.id !== userId) {
                return;
            }

            const opponentName =
                battleState.currentBattle?.opponent?.username || "Opponent";

            // Create message based on result
            let message = "";
            if (result) {
                const status = result.status;
                const testsPassed = result.testCasesPassed || 0;
                const totalTests = result.totalTestCases || 0;

                if (type === "run") {
                    if (status === "ACCEPTED") {
                        message = `${opponentName} ran code - ✅ All tests passed (${testsPassed}/${totalTests})`;
                    } else if (status === "WRONG_ANSWER") {
                        message = `${opponentName} ran code - ❌ Wrong answer (${testsPassed}/${totalTests})`;
                    } else {
                        message = `${opponentName} ran code - ${status}`;
                    }
                } else {
                    if (status === "ACCEPTED") {
                        message = `${opponentName} submitted - ✅ Accepted!`;
                    } else if (status === "WRONG_ANSWER") {
                        message = `${opponentName} submitted - ❌ Wrong answer`;
                    } else {
                        message = `${opponentName} submitted - ${status}`;
                    }
                }
            } else {
                // Fallback for old events without result
                message =
                    type === "run"
                        ? `${opponentName} ran their code`
                        : `${opponentName} submitted their code`;
            }

            const notification = {
                id: `${Date.now()}-${Math.random()}`,
                message,
                type,
                timestamp: Date.now(),
                avatarUrl: battleState.currentBattle?.opponent?.profileImageUrl,
                username: opponentName,
            };

            setBattleNotifications((prev) => [...prev, notification]);

            setTimeout(() => {
                setBattleNotifications((prev) =>
                    prev.filter((n) => n.id !== notification.id)
                );
            }, 5000);
        };

        const handleMessageReceived = (event: any) => {
            const { userId, message: text } = event.detail;

            if (battleState.currentBattle?.opponent?.id !== userId) {
                return;
            }

            const opponentName =
                battleState.currentBattle?.opponent?.username || "Opponent";

            const notification = {
                id: `${Date.now()}-${Math.random()}`,
                message: text,
                type: "message" as const,
                timestamp: Date.now(),
                avatarUrl: battleState.currentBattle?.opponent?.profileImageUrl,
                username: opponentName,
            };

            setBattleNotifications((prev) => [...prev, notification]);

            setTimeout(() => {
                setBattleNotifications((prev) =>
                    prev.filter((n) => n.id !== notification.id)
                );
            }, 5000);
        };

        window.addEventListener("battle-opponent-action", handleOpponentAction);
        window.addEventListener(
            "battle-message-received",
            handleMessageReceived
        );

        return () => {
            window.removeEventListener(
                "battle-opponent-action",
                handleOpponentAction
            );
            window.removeEventListener(
                "battle-message-received",
                handleMessageReceived
            );
        };
    }, [battleState.currentBattle]);

    const handleExitBattle = () => {
        if (
            battleState.currentBattle &&
            battleState.currentBattle.status === "active"
        ) {
            forfeitBattle(battleState.currentBattle.id);
        }
    };

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

        if (
            battleState.currentBattle &&
            battleState.currentBattle.status === "active"
        ) {
            console.log("⚔️ Running code in battle mode!");

            runBattleCode(battleState.currentBattle.id, code, selectedLanguage);
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
                battleId: battleState.currentBattle?.id,
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

        if (
            battleState.currentBattle &&
            battleState.currentBattle.status === "active"
        ) {
            console.log("⚔️ Submitting code in battle mode!");

            submitBattleCode(
                battleState.currentBattle.id,
                code,
                selectedLanguage
            );
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
                battleId: battleState.currentBattle?.id,
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

            <main className="flex-1 w-full px-6 pt-10 pb-6 flex flex-col overflow-hidden relative">
                <ProblemHeader
                    problem={problem}
                    battleInfo={
                        battleState.currentBattle
                            ? {
                                  id: battleState.currentBattle.id,
                                  opponent: battleState.currentBattle.opponent,
                                  timeLimit:
                                      battleState.currentBattle.timeLimit,
                                  status: battleState.currentBattle.status,
                                  startTime: battleStartTime || undefined,
                              }
                            : undefined
                    }
                    onExitBattle={handleExitBattle}
                />

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
                            isBattleMode={
                                !!battleState.currentBattle &&
                                battleState.currentBattle.status === "active"
                            }
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

                {/* Battle Notifications */}
                {battleNotifications.length > 0 && (
                    <div className="fixed bottom-20 right-4 z-50 space-y-2">
                        {battleNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right ${
                                    notification.type === "run"
                                        ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                                        : notification.type === "message"
                                        ? "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800"
                                        : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border-2">
                                        <AvatarImage
                                            src={notification.avatarUrl}
                                        />
                                        <AvatarFallback className="text-xs">
                                            {notification.username
                                                ?.charAt(0)
                                                ?.toUpperCase() || "O"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">
                                        {notification.message}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Battle End Dialog */}
                {battleEndData && (
                    <BattleEndDialog
                        open={showBattleEndDialog}
                        isWinner={battleEndData.isWinner}
                        isDraw={battleEndData.isDraw}
                        opponentName={battleEndData.opponentName}
                        onClose={handleBattleEndDialogClose}
                    />
                )}

                {/* Battle Chat Box */}
                {battleState.currentBattle &&
                    battleState.currentBattle.status === "active" && (
                        <BattleChatBox
                            battleId={battleState.currentBattle.id}
                            currentUserId={user?.id || ""}
                            opponentUsername={
                                battleState.currentBattle.opponent?.username
                            }
                            onSendMessage={(message) =>
                                sendMessage(
                                    battleState.currentBattle!.id,
                                    message
                                )
                            }
                        />
                    )}
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
