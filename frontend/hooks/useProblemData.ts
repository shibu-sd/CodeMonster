import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiWithAuth, Problem } from "@/lib/api";
import { AcceptedSolution } from "@/types";

interface UseProblemDataProps {
    slug: string;
}

export function useProblemData({ slug }: UseProblemDataProps) {
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [acceptedSolution, setAcceptedSolution] =
        useState<AcceptedSolution | null>(null);

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
    }, [isLoaded, isSignedIn, getToken, api]);

    const fetchProblem = async () => {
        try {
            setLoading(true);
            const response = await api.getProblem(slug);

            if (response.success) {
                setProblem(response.data);
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
            console.log("No accepted solution found");
        }
    };

    useEffect(() => {
        if (slug && authReady) {
            fetchProblem();
        }
    }, [slug, authReady]);

    useEffect(() => {
        if (problem && authReady && isSignedIn) {
            loadAcceptedSolution();
        }
    }, [problem, authReady, isSignedIn]);

    return {
        problem,
        loading,
        error,
        acceptedSolution,
        refetch: fetchProblem,
        loadAcceptedSolution,
    };
}
