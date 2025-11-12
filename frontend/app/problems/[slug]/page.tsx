"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HeroHeader } from "@/components/header/header";
import { useUser } from "@clerk/nextjs";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { ProblemDetailSkeleton } from "@/components/skeletons/problems/problem-detail-skeleton";
import { ProblemHeader } from "@/components/problems-detail/problem-header";
import { ProblemContentTabs } from "@/components/problems-detail/problem-content-tabs";
import { CodeEditorPanel } from "@/components/problems-detail/code-editor-panel";
import { ResultsPanel } from "@/components/problems-detail/results-panel";
import { ProblemErrorState } from "@/components/problems-detail/problem-error-state";
import { useBattle } from "@/contexts/BattleContext";
import { DotPattern } from "@/components/ui/dot-pattern";
import { useProblemData } from "@/hooks/useProblemData";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useSubmissionPolling } from "@/hooks/useSubmissionPolling";
import { useBattleNotifications } from "@/hooks/useBattleNotifications";

// Lazy load battle-specific components - only loads when battle is active
const BattleNotifications = dynamic(
    () =>
        import("@/components/problems-detail/battle-notifications").then(
            (mod) => mod.BattleNotifications
        ),
    { ssr: false }
);

const BattleEndDialog = dynamic(
    () =>
        import("@/components/battle/battle-end-dialog").then(
            (mod) => mod.BattleEndDialog
        ),
    { ssr: false }
);

const BattleChatBox = dynamic(
    () =>
        import("@/components/battle/battle-chat-box").then(
            (mod) => mod.BattleChatBox
        ),
    { ssr: false }
);

function ProblemDetailPageContent() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { user } = useUser();
    const {
        battleState,
        runCode: runBattleCode,
        submitCode: submitBattleCode,
        forfeitBattle,
        sendMessage,
        clearBattleState,
    } = useBattle();

    // UI state
    const [activeTab, setActiveTab] = useState<
        "description" | "submissions" | "editorial"
    >("description");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("PYTHON");
    const [code, setCode] = useState<string>("");

    const availableLanguages = [
        { id: "PYTHON", name: "Python", extension: "py" },
        { id: "JAVA", name: "Java", extension: "java" },
        { id: "CPP", name: "C++", extension: "cpp" },
    ];

    // Custom hooks
    const { problem, loading, error, acceptedSolution, loadAcceptedSolution } =
        useProblemData({ slug });

    const {
        isRunning,
        runResult,
        showRunPanel,
        activeTestCase: runActiveTestCase,
        handleRunCode,
        setShowRunPanel,
        setActiveTestCase: setRunActiveTestCase,
    } = useCodeExecution({
        problem,
        code,
        selectedLanguage,
        battleId: battleState.currentBattle?.id,
        onBattleRun: runBattleCode,
    });

    const {
        isSubmitting,
        submissionResult,
        showSubmitPanel,
        pollingAttempts,
        handleSubmitCode,
        setShowSubmitPanel,
    } = useSubmissionPolling({
        problem,
        code,
        selectedLanguage,
        battleId: battleState.currentBattle?.id,
        onBattleSubmit: submitBattleCode,
        onAccepted: loadAcceptedSolution,
        onActiveTabChange: setActiveTab,
    });

    const {
        battleNotifications,
        showBattleEndDialog,
        battleEndData,
        handleBattleEndDialogClose,
    } = useBattleNotifications({
        battleState,
        onClearBattleState: clearBattleState,
    });

    const battleStartTime = battleState.currentBattle?.startTime
        ? new Date(battleState.currentBattle.startTime)
        : null;

    useEffect(() => {
        if (problem?.title) {
            document.title = `${problem.title} - CodeMonster`;
        } else {
            document.title = "Problem - CodeMonster";
        }
    }, [problem?.title]);

    useEffect(() => {
        if (problem) {
            const starterCode = getStarterCodeForLanguage(selectedLanguage);
            setCode(starterCode);
        }
    }, [problem, selectedLanguage]);

    const handleExitBattle = () => {
        if (
            battleState.currentBattle &&
            battleState.currentBattle.status === "active"
        ) {
            forfeitBattle(battleState.currentBattle.id);
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
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />
                <div className="relative z-10">
                    <ProblemErrorState
                        error={error}
                        onGoBack={() => router.back()}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />

            <main className="flex-1 w-full px-6 pt-10 pb-6 flex flex-col overflow-hidden relative z-10">
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

                <div className="flex-1 overflow-hidden flex">
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

                    <div className="w-1/2 flex flex-col h-full pl-3">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="h-full"
                        >
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
                                activeTestCase={runActiveTestCase}
                                onTestCaseChange={setRunActiveTestCase}
                                onClose={closeResultPanel}
                                pollingAttempts={pollingAttempts}
                            />
                        </ResizablePanelGroup>
                    </div>
                </div>

                <BattleNotifications notifications={battleNotifications} />

                {battleEndData && (
                    <BattleEndDialog
                        open={showBattleEndDialog}
                        isWinner={battleEndData.isWinner}
                        isDraw={battleEndData.isDraw}
                        opponentName={battleEndData.opponentName}
                        onClose={handleBattleEndDialogClose}
                    />
                )}

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
    return <ProblemDetailPageContent />;
}
