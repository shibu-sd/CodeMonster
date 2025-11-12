import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiWithAuth, Problem } from "@/lib/api";
import { RunResult } from "@/types";

interface UseCodeExecutionProps {
    problem: Problem | null;
    code: string;
    selectedLanguage: string;
    battleId?: string;
    onBattleRun?: (battleId: string, code: string, language: string) => void;
}

export function useCodeExecution({
    problem,
    code,
    selectedLanguage,
    battleId,
    onBattleRun,
}: UseCodeExecutionProps) {
    const api = useApiWithAuth();
    const { isSignedIn, getToken } = useAuth();

    const [isRunning, setIsRunning] = useState(false);
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    const [showRunPanel, setShowRunPanel] = useState(false);
    const [activeTestCase, setActiveTestCase] = useState(0);

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

        if (battleId && onBattleRun) {
            console.log("⚔️ Running code in battle mode!");
            onBattleRun(battleId, code, selectedLanguage);
        }

        console.log(`🔧 Running code for problem: ${problem.id}`);
        console.log(`📝 Language: ${selectedLanguage}`);
        console.log(`💻 Code length: ${code.length} characters`);

        try {
            setIsRunning(true);
            setRunResult({ status: "RUNNING" });
            setShowRunPanel(true);
            setActiveTestCase(0);

            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

            const response = await api.runCode({
                problemId: problem.id,
                language: selectedLanguage,
                code: code,
                battleId: battleId,
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

    return {
        isRunning,
        runResult,
        showRunPanel,
        activeTestCase,
        handleRunCode,
        setShowRunPanel,
        setActiveTestCase,
    };
}
