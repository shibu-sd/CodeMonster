"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { useAuth } from "@clerk/nextjs";
import { useApiWithAuth, Problem, ProblemStats } from "@/lib/api";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ProblemsListSkeleton } from "@/components/skeletons/problems/problems-list-skeleton";
import { ProblemsErrorState } from "@/components/problems/problems-error-state";
import { ProblemsStatsCards } from "@/components/problems/problems-stats-cards";
import { ProblemsFilters } from "@/components/problems/problems-filters";
import { ProblemsTable } from "@/components/problems/problems-table";
import { ProblemsPagination } from "@/components/problems/problems-pagination";

function ProblemsPageContent() {
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [stats, setStats] = useState<ProblemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [authReady, setAuthReady] = useState(false);
    const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(
        new Set()
    );

    // Set page title
    useEffect(() => {
        document.title = "Problems - CodeMonster";
    }, []);

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
        if (authReady) {
            // Parallelize all API calls
            Promise.all([
                fetchProblems(),
                fetchStats(),
                isSignedIn ? fetchSolvedProblems() : Promise.resolve(),
            ]);
        }
    }, [currentPage, selectedDifficulty, searchTerm, authReady, isSignedIn]);

    const fetchSolvedProblems = useCallback(async () => {
        if (!isSignedIn) return;

        try {
            const response = await api.getUserDashboard();
            if (response.success && response.data.solvedProblems) {
                const solvedIds = new Set<string>(
                    response.data.solvedProblems.map(
                        (p: any) => p.problemId as string
                    )
                );
                setSolvedProblemIds(solvedIds);
            }
        } catch (err) {
            console.log("Could not fetch solved problems:", err);
        }
    }, [isSignedIn, api]);

    const fetchProblems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.getProblems({
                page: currentPage,
                limit: 10,
                difficulty: selectedDifficulty || undefined,
                search: searchTerm || undefined,
            });

            if (response.success) {
                setProblems(response.data.data || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                setError("Failed to fetch problems");
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch problems"
            );
        } finally {
            setLoading(false);
        }
    }, [api, currentPage, selectedDifficulty, searchTerm]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.getProblemStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    }, [api]);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    }, []);

    const handleDifficultyFilter = useCallback((difficulty: string) => {
        setSelectedDifficulty((prev) =>
            difficulty === prev ? "" : difficulty
        );
        setCurrentPage(1);
    }, []);

    if (loading) {
        return <ProblemsListSkeleton />;
    }

    if (error) {
        return <ProblemsErrorState error={error} onRetry={fetchProblems} />;
    }

    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />

            <HeroHeader />

            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Problem Set</h1>
                    <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Every problem solved feeds the monster inside you
                    </p>

                    <ProblemsStatsCards stats={stats} />

                    <ProblemsFilters
                        searchTerm={searchTerm}
                        selectedDifficulty={selectedDifficulty}
                        onSearchChange={setSearchTerm}
                        onSearchSubmit={handleSearch}
                        onDifficultyChange={handleDifficultyFilter}
                    />
                </div>

                <ProblemsTable
                    problems={problems}
                    solvedProblemIds={solvedProblemIds}
                    currentPage={currentPage}
                />

                <ProblemsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </main>

            <FooterSection />
        </div>
    );
}

export default function ProblemsPage() {
    return <ProblemsPageContent />;
}
