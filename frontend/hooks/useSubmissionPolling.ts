import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiWithAuth, Problem } from "@/lib/api";
import { SubmissionResult } from "@/types";

interface UseSubmissionPollingProps {
    problem: Problem | null;
    code: string;
    selectedLanguage: string;
    battleId?: string;
    onBattleSubmit?: (battleId: string, code: string, language: string) => void;
    onAccepted?: () => void;
    onActiveTabChange?: (
        tab: "description" | "submissions" | "editorial"
    ) => void;
}

export function useSubmissionPolling({
    problem,
    code,
    selectedLanguage,
    battleId,
    onBattleSubmit,
    onAccepted,
    onActiveTabChange,
}: UseSubmissionPollingProps) {
    const api = useApiWithAuth();
    const { isSignedIn, getToken } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] =
        useState<SubmissionResult | null>(null);
    const [currentSubmissionId, setCurrentSubmissionId] = useState<
        string | null
    >(null);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [pollingAttempts, setPollingAttempts] = useState<number>(0);
    const [showSubmitPanel, setShowSubmitPanel] = useState(false);

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
                            setSubmissionResult((prev) => ({
                                ...(prev || {}),
                                status: "TIMEOUT",
                                error: "Submission timed out",
                            }));
                            setIsSubmitting(false);
                        }
                    } else {
                        console.log(`🎉 Final result: ${status}`);
                        setIsSubmitting(false);

                        if (status === "ACCEPTED") {
                            onAccepted?.();
                            onActiveTabChange?.("submissions");
                        }
                    }
                } else {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 2000);
                    } else {
                        setSubmissionResult((prev) => ({
                            ...(prev || {}),
                            status: "ERROR",
                            error: "Failed to get submission status",
                        }));
                        setIsSubmitting(false);
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
                if (attempts < maxAttempts) {
                    setTimeout(poll, 2000);
                } else {
                    setSubmissionResult((prev) => ({
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

        if (battleId && onBattleSubmit) {
            console.log("⚔️ Submitting code in battle mode!");
            onBattleSubmit(battleId, code, selectedLanguage);
        }

        console.log(`🔧 Submitting code for problem: ${problem.id}`);
        console.log(`📝 Language: ${selectedLanguage}`);
        console.log(`💻 Code length: ${code.length} characters`);

        try {
            setIsSubmitting(true);
            setSubmissionResult({ status: "PENDING" });
            setShowSubmitPanel(true);
            setPollingAttempts(0);

            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

            const response = await api.submitCode({
                problemId: problem.id,
                language: selectedLanguage,
                code: code,
                battleId: battleId,
            });

            console.log("📊 Submit API response:", response);

            if (response.success && response.data) {
                setCurrentSubmissionId(response.data.submissionId);
                setCurrentJobId(response.data.jobId);
                setSubmissionResult({
                    id: response.data.submissionId,
                    status: "PENDING",
                });

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

    return {
        isSubmitting,
        submissionResult,
        showSubmitPanel,
        pollingAttempts,
        currentSubmissionId,
        currentJobId,
        handleSubmitCode,
        setShowSubmitPanel,
    };
}
