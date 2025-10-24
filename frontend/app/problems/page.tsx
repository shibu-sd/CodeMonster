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
            const minimumDisplayTime = 1000; // 1 second minimum

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
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-32 pb-16">
                    <div className="mb-8">
                        <Skeleton className="h-12 w-48 mb-4" />
                        <Skeleton className="h-6 w-96 mb-6" />

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
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-24 pb-16">
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
        <div className="min-h-screen bg-background">
            <HeroHeader />

            <main className="container mx-auto px-4 pt-32 pb-16">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">Problem Set</h1>
                    <p className="text-xl text-muted-foreground mb-6">
                        Challenge yourself with coding problems from easy to
                        hard
                    </p>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-card rounded-lg p-4 border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">
                                        Total
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="bg-card rounded-lg p-4 border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Trophy className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium">
                                        Easy
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.easy}
                                </p>
                            </div>
                            <div className="bg-card rounded-lg p-4 border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    <span className="text-sm font-medium">
                                        Medium
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {stats.medium}
                                </p>
                            </div>
                            <div className="bg-card rounded-lg p-4 border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Users className="h-5 w-5 text-red-500" />
                                    <span className="text-sm font-medium">
                                        Hard
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-red-600">
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
                            <Button
                                variant={
                                    selectedDifficulty === "EASY"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => handleDifficultyFilter("EASY")}
                                className="text-green-600"
                            >
                                Easy
                            </Button>
                            <Button
                                variant={
                                    selectedDifficulty === "MEDIUM"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => handleDifficultyFilter("MEDIUM")}
                                className="text-yellow-600"
                            >
                                Medium
                            </Button>
                            <Button
                                variant={
                                    selectedDifficulty === "HARD"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => handleDifficultyFilter("HARD")}
                                className="text-red-600"
                            >
                                Hard
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Problems Table */}
                <div className="bg-card rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium">
                                        Problem
                                    </th>
                                    <th className="text-center py-3 px-4 font-medium">
                                        Difficulty
                                    </th>
                                    <th className="text-center py-3 px-4 font-medium">
                                        Acceptance
                                    </th>
                                    <th className="text-center py-3 px-4 font-medium">
                                        Submissions
                                    </th>
                                    <th className="text-center py-3 px-4 font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems?.map((problem, index) => (
                                    <tr
                                        key={problem?.id || index}
                                        className="border-t hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <Link
                                                href={`/problems/${
                                                    problem?.slug || "unknown"
                                                }`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        {(currentPage - 1) *
                                                            10 +
                                                            index +
                                                            1}
                                                        .
                                                    </span>
                                                    <span className="font-medium">
                                                        {problem?.title ||
                                                            "Unknown Problem"}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                                                    problem?.difficulty ||
                                                        "EASY"
                                                )}`}
                                            >
                                                {problem?.difficulty || "EASY"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm">
                                                {formatAcceptanceRate(
                                                    problem?.acceptanceRate
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm">
                                                {formatSubmissionCount(
                                                    problem?.totalSubmissions
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {solvedProblemIds.has(
                                                problem?.id || ""
                                            ) && (
                                                <CheckCircle className="h-5 w-5 text-green-500 inline-block" />
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
