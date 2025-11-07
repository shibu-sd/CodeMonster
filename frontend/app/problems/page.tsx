"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    BarChart3,
    Trophy,
    Clock,
    Users,
    CheckCircle,
    Star,
} from "lucide-react";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@clerk/nextjs";
import {
    useApiWithAuth,
    Problem,
    ProblemStats,
    getDifficultyColor,
    getDifficultyBadgeColor,
    formatAcceptanceRate,
    formatSubmissionCount,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/ui/dot-pattern";

function ProblemsPageContent() {
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [stats, setStats] = useState<ProblemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const skeletonStartTime = useRef<number>(Date.now());
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [authReady, setAuthReady] = useState(false);
    const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(
        new Set()
    );

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

    // Fetch solved problems when user is authenticated
    useEffect(() => {
        if (authReady && isSignedIn) {
            fetchSolvedProblems();
        }
    }, [authReady, isSignedIn]);

    // Handle minimum skeleton display time
    useEffect(() => {
        if (!loading && showSkeleton) {
            const elapsedTime = Date.now() - skeletonStartTime.current;
            const minimumDisplayTime = 500; // 0.5 second minimum

            if (elapsedTime < minimumDisplayTime) {
                const remainingTime = minimumDisplayTime - elapsedTime;
                const timer = setTimeout(() => {
                    setShowSkeleton(false);
                }, remainingTime);

                return () => clearTimeout(timer);
            } else {
                setShowSkeleton(false);
            }
        }

        if (loading && !showSkeleton) {
            setShowSkeleton(true);
            skeletonStartTime.current = Date.now();
        }
    }, [loading, showSkeleton]);

    // Fetch problems and stats
    useEffect(() => {
        if (authReady) {
            fetchProblems();
            fetchStats();
        }
    }, [currentPage, selectedDifficulty, searchTerm, authReady]);

    const fetchSolvedProblems = async () => {
        if (!isSignedIn) return;

        try {
            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

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
    };

    const fetchProblems = async () => {
        try {
            setLoading(true);
            const response = await api.getProblems({
                page: currentPage,
                limit: 10,
                difficulty: selectedDifficulty || undefined,
                search: searchTerm || undefined,
            });

            if (response.success) {
                // Handle actual API response format: data.data contains problems
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
    };

    const fetchStats = async () => {
        try {
            const response = await api.getProblemStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProblems();
    };

    const handleDifficultyFilter = (difficulty: string) => {
        setSelectedDifficulty(
            difficulty === selectedDifficulty ? "" : difficulty
        );
        setCurrentPage(1);
    };

    if (showSkeleton) {
        return (
            <div className="min-h-screen bg-background relative">
                {/* Dot Pattern Background */}
                <DotPattern className="opacity-30" />

                <HeroHeader />
                <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    <div className="mb-8 text-center">
                        <Skeleton className="h-12 w-48 mb-4 mx-auto" />
                        <Skeleton className="h-6 w-96 mb-6 mx-auto" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-card rounded-lg p-4 border"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Skeleton className="h-5 w-5" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-16" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium">
                                            <Skeleton className="h-5 w-20" />
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium">
                                            <Skeleton className="h-5 w-20 mx-auto" />
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium">
                                            <Skeleton className="h-5 w-20 mx-auto" />
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium">
                                            <Skeleton className="h-5 w-20 mx-auto" />
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium">
                                            <Skeleton className="h-5 w-16 mx-auto" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(10)].map((_, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <Skeleton className="h-4 w-6" />
                                                    <Skeleton className="h-5 w-48" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Skeleton className="h-4 w-12 mx-auto" />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Skeleton className="h-4 w-16 mx-auto" />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Skeleton className="h-5 w-5 mx-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <Skeleton className="h-10 w-20" />
                        <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-10" />
                            ))}
                        </div>
                        <Skeleton className="h-10 w-12" />
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background relative">
                {/* Dot Pattern Background */}
                <DotPattern className="opacity-30" />

                <HeroHeader />
                <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-red-500 mb-4">❌</div>
                            <h2 className="text-2xl font-bold mb-2">
                                Error Loading Problems
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {error}
                            </p>
                            <Button onClick={fetchProblems}>Try Again</Button>
                        </div>
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative">
            {/* Dot Pattern Background */}
            <DotPattern className="opacity-30" />

            <HeroHeader />

            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Problem Set</h1>
                    <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Every problem solved feeds the monster inside you
                    </p>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            {/* Total Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                                        Total
                                    </span>
                                    <div className="p-2 bg-blue-200 dark:bg-blue-800/50 rounded-lg">
                                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                    {stats.total}
                                </p>
                            </div>

                            {/* Easy Card */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                        Easy
                                    </span>
                                    <div className="p-2 bg-green-200 dark:bg-green-800/50 rounded-lg">
                                        <Star className="h-5 w-5 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                                    {stats.easy}
                                </p>
                            </div>

                            {/* Medium Card */}
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                                        Medium
                                    </span>
                                    <div className="p-2 bg-yellow-200 dark:bg-yellow-800/50 rounded-lg flex items-center">
                                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400 -ml-1" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                                    {stats.medium}
                                </p>
                            </div>

                            {/* Hard Card */}
                            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                                        Hard
                                    </span>
                                    <div className="p-2 bg-red-200 dark:bg-red-800/50 rounded-lg flex items-center">
                                        <Star className="h-4 w-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
                                        <Star className="h-4 w-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400 -ml-1" />
                                        <Star className="h-4 w-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400 -ml-1" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                                    {stats.hard}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search problems..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </form>

                        <div className="flex gap-2">
                            {selectedDifficulty === "EASY" ? (
                                <button
                                    onClick={() =>
                                        handleDifficultyFilter("EASY")
                                    }
                                    className="p-[3px] relative h-10 rounded-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-lg" />
                                    <div className="px-6 h-full flex items-center justify-center rounded-[6px] relative transition duration-200 text-base font-medium bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                                        Easy
                                    </div>
                                </button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() =>
                                        handleDifficultyFilter("EASY")
                                    }
                                    className="text-green-600 hover:text-green-400 transform hover:scale-105 transition-all duration-200 h-10 px-6 text-base"
                                >
                                    Easy
                                </Button>
                            )}
                            {selectedDifficulty === "MEDIUM" ? (
                                <button
                                    onClick={() =>
                                        handleDifficultyFilter("MEDIUM")
                                    }
                                    className="p-[3px] relative h-10 rounded-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg" />
                                    <div className="px-6 h-full flex items-center justify-center rounded-[6px] relative transition duration-200 text-base font-medium bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">
                                        Medium
                                    </div>
                                </button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() =>
                                        handleDifficultyFilter("MEDIUM")
                                    }
                                    className="text-yellow-600 hover:text-yellow-400 transform hover:scale-105 transition-all duration-200 h-10 px-6 text-base"
                                >
                                    Medium
                                </Button>
                            )}
                            {selectedDifficulty === "HARD" ? (
                                <button
                                    onClick={() =>
                                        handleDifficultyFilter("HARD")
                                    }
                                    className="p-[3px] relative h-10 rounded-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-lg" />
                                    <div className="px-6 h-full flex items-center justify-center rounded-[6px] relative transition duration-200 text-base font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                                        Hard
                                    </div>
                                </button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() =>
                                        handleDifficultyFilter("HARD")
                                    }
                                    className="text-red-600 hover:text-red-400 transform hover:scale-105 transition-all duration-200 h-10 px-6 text-base"
                                >
                                    Hard
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Problems Table */}
                <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-muted/80 to-muted/60">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                        Problem
                                    </th>
                                    <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                        Difficulty
                                    </th>
                                    <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                        Acceptance
                                    </th>
                                    <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                        Submissions
                                    </th>
                                    <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems?.map((problem, index) => (
                                    <tr
                                        key={problem?.id || index}
                                        className="border-t border-border/50 hover:bg-muted/20 transition-all duration-200 group"
                                    >
                                        <td className="py-5 px-6">
                                            <Link
                                                href={`/problems/${
                                                    problem?.slug || "unknown"
                                                }`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-medium text-muted-foreground min-w-[2rem]">
                                                        {(currentPage - 1) *
                                                            10 +
                                                            index +
                                                            1}
                                                        .
                                                    </span>
                                                    <span className="font-semibold text-base group-hover:underline">
                                                        {problem?.title ||
                                                            "Unknown Problem"}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getDifficultyBadgeColor(
                                                    problem?.difficulty ||
                                                        "EASY"
                                                )}`}
                                            >
                                                {problem?.difficulty || "EASY"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-sm font-medium">
                                                {formatAcceptanceRate(
                                                    problem?.acceptanceRate
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {formatSubmissionCount(
                                                    problem?.totalSubmissions
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            {solvedProblemIds.has(
                                                problem?.id || ""
                                            ) && (
                                                <div className="flex justify-center">
                                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>

                        <div className="flex space-x-1">
                            {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={
                                                currentPage === pageNum
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setCurrentPage(pageNum)
                                            }
                                            className="min-w-[40px]"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                }
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(totalPages, prev + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </main>

            <FooterSection />
        </div>
    );
}

export default function ProblemsPage() {
    return (
        <ProtectedPage
            fallbackTitle="Authentication Required"
            fallbackMessage="You need to sign in to access the problems."
        >
            <ProblemsPageContent />
        </ProtectedPage>
    );
}
