"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApiWithAuth } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/nextjs";
import { ProtectedPage } from "@/components/auth/protected-page";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import {
    Trophy,
    Target,
    Swords,
    Code,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Calendar,
    Tag,
    BarChart3,
    ChevronRight,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { getDifficultyBadgeColor } from "@/lib/api";
import {
    ContributionData,
    ContributionGraph,
} from "@/components/ui/ContributionGraph";
import { DotPattern } from "@/components/ui/dot-pattern";

interface DashboardData {
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImageUrl: string;
        problemsSolved: number;
        battlesWon: number;
        totalSubmissions: number;
        acceptedSubmissions: number;
        acceptanceRate: number;
        createdAt: string;
    };
    solvedProblems: Array<{
        id: string;
        problemId: string;
        title: string;
        slug: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        tags: string[];
        solvedAt: string;
        acceptedLanguage: string;
        acceptedRuntime: number;
        acceptedMemory: number;
    }>;
    recentSubmissions: Array<{
        id: string;
        problemId: string;
        problemTitle: string;
        problemSlug: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        language: string;
        status: string;
        runtime: number;
        memoryUsage: number;
        submittedAt: string;
        completedAt: string;
    }>;
    stats: {
        difficultyBreakdown: {
            easy: number;
            medium: number;
            hard: number;
        };
        topTags: Array<{
            tag: string;
            count: number;
        }>;
        submissionHistory: any[];
    };
}

function DashboardPageContent() {
    const router = useRouter();
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const skeletonStartTime = useRef<number>(Date.now());
    const [contributionData, setContributionData] = useState<
        ContributionData[]
    >([]);
    const [contributionYear, setContributionYear] = useState(
        new Date().getFullYear()
    );
    const [loadingContribution, setLoadingContribution] = useState(false);

    useEffect(() => {
        const initDashboard = async () => {
            if (isLoaded && isSignedIn) {
                try {
                    const token = await getToken();
                    if (token) {
                        api.setAuthToken(token);
                        await Promise.all([
                            loadDashboard(),
                            loadContributionData(),
                        ]);
                    }
                } catch (err) {
                    console.error("Failed to get token:", err);
                    setError("Authentication failed");
                    setLoading(false);
                }
            } else if (isLoaded && !isSignedIn) {
                router.push("/auth/sign-in");
            }
        };

        initDashboard();
    }, [isLoaded, isSignedIn]);

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

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

            const response = await api.getUserDashboard();

            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                setError("Failed to load dashboard data");
            }
        } catch (err) {
            console.error("Error loading dashboard:", err);
            setError("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const loadContributionData = async (year: number = contributionYear) => {
        try {
            setLoadingContribution(true);
            const response = await api.getUserContributionData(year);

            if (response.success && response.data) {
                setContributionData(response.data);
                setContributionYear(year);
            } else {
                console.error("Failed to load contribution data");
            }
        } catch (err) {
            console.error("Error loading contribution data:", err);
        } finally {
            setLoadingContribution(false);
        }
    };

    if (showSkeleton) {
        return (
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />
                <div className="flex-1 container mx-auto px-4 pt-32 pb-8 max-w-7xl relative z-10">
                    {/* User Profile Skeleton */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="w-20 h-20 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-9 w-64 mb-2" />
                                <Skeleton className="h-5 w-48" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-muted/20 rounded-xl p-6 border shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                </div>
                                <Skeleton className="h-9 w-16 mx-auto" />
                            </div>
                        ))}
                    </div>

                    {/* Main Content Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column Skeleton */}
                        <div className="space-y-6">
                            <Card className="p-6">
                                <div className="flex items-center mb-4">
                                    <Skeleton className="h-5 w-5 mr-2" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-2">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-4 w-8" />
                                            </div>
                                            <Skeleton className="h-2 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center mb-4">
                                    <Skeleton className="h-5 w-5 mr-2" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <div className="space-y-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                                        >
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-5 w-8 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Right Column Skeleton */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Skeleton className="h-5 w-5 mr-2" />
                                        <Skeleton className="h-6 w-48" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-64 w-full" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Skeleton className="h-5 w-5 mr-2" />
                                        <Skeleton className="h-6 w-40" />
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Skeleton className="h-5 w-48" />
                                                        <Skeleton className="h-4 w-12 rounded-full" />
                                                        <Skeleton className="h-4 w-16 rounded-full" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-3 w-16" />
                                                        <Skeleton className="h-3 w-12" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-5 w-5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen flex flex-col relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />
                <div className="flex-1 flex items-center justify-center pt-20 relative z-10">
                    <div className="text-center max-w-md mx-auto px-4">
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                        <p className="text-lg font-medium mb-2">
                            Failed to load dashboard
                        </p>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        {error?.includes("Cannot connect") && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-left">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                    🔧 Server Connection Issue
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                                    The backend server is not responding. Please
                                    make sure:
                                </p>
                                <ul className="text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                                    <li>
                                        Server is running:{" "}
                                        <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                                            cd server && npm run dev
                                        </code>
                                    </li>
                                    <li>
                                        Redis is running:{" "}
                                        <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                                            docker-compose -f
                                            docker-compose.redis-only.yml up -d
                                        </code>
                                    </li>
                                    <li>
                                        Or run all services:{" "}
                                        <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                                            start-all-local.bat
                                        </code>
                                    </li>
                                </ul>
                            </div>
                        )}
                        <Button onClick={loadDashboard}>Try Again</Button>
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    const { user, solvedProblems, recentSubmissions, stats } = dashboardData;
    const { difficultyBreakdown, topTags } = stats;

    return (
        <div className="min-h-screen flex flex-col relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="flex-1 container mx-auto px-4 pt-32 pb-8 max-w-7xl relative z-10">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        {user.profileImageUrl && (
                            <img
                                src={user.profileImageUrl}
                                alt={user.username || "User"}
                                className="w-20 h-20 rounded-full border-4 border-primary"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">
                                {user.firstName || user.username || "User"}
                                's Dashboard
                            </h1>
                            <p className="text-muted-foreground">
                                @{user.username || "user"} • Member since{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-lg text-center">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                Problems Solved
                            </span>
                            <div className="p-2 bg-green-200 dark:bg-green-800/50 rounded-lg">
                                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                            {user.problemsSolved}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg text-center">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                                Total Submissions
                            </span>
                            <div className="p-2 bg-blue-200 dark:bg-blue-800/50 rounded-lg">
                                <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                            {user.totalSubmissions}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-lg text-center">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                                Acceptance Rate
                            </span>
                            <div className="p-2 bg-purple-200 dark:bg-purple-800/50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                            {user.acceptanceRate}%
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-lg text-center">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                                Battles Won
                            </span>
                            <div className="p-2 bg-orange-200 dark:bg-orange-800/50 rounded-lg">
                                <Swords className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                            {user.battlesWon}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2" />
                                Difficulty Breakdown
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                            Easy
                                        </span>
                                        <span className="font-bold">
                                            {difficultyBreakdown.easy}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${
                                                    (difficultyBreakdown.easy /
                                                        user.problemsSolved) *
                                                        100 || 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                            Medium
                                        </span>
                                        <span className="font-bold">
                                            {difficultyBreakdown.medium}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{
                                                width: `${
                                                    (difficultyBreakdown.medium /
                                                        user.problemsSolved) *
                                                        100 || 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-red-600 dark:text-red-400 font-medium">
                                            Hard
                                        </span>
                                        <span className="font-bold">
                                            {difficultyBreakdown.hard}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{
                                                width: `${
                                                    (difficultyBreakdown.hard /
                                                        user.problemsSolved) *
                                                        100 || 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <Tag className="h-5 w-5 mr-2" />
                                Top Tags
                            </h2>
                            <div className="space-y-2">
                                {topTags.slice(0, 8).map((tagItem) => (
                                    <div
                                        key={tagItem.tag}
                                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                                    >
                                        <span className="text-sm font-medium">
                                            {tagItem.tag}
                                        </span>
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                            {tagItem.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Contribution Activity
                            </h2>
                            <div className="space-y-4">
                                {loadingContribution ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                {contributionYear}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        loadContributionData(
                                                            contributionYear - 1
                                                        )
                                                    }
                                                    className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
                                                >
                                                    ← {contributionYear - 1}
                                                </button>
                                                {contributionYear !==
                                                    new Date().getFullYear() && (
                                                    <button
                                                        onClick={() =>
                                                            loadContributionData(
                                                                new Date().getFullYear()
                                                            )
                                                        }
                                                        className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
                                                    >
                                                        Current
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-background max-w-4xl rounded-lg border p-2 mx-auto">
                                            <ContributionGraph
                                                data={contributionData}
                                                year={contributionYear}
                                                showLegend={true}
                                                showTooltips={true}
                                                className="w-full"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold flex items-center">
                                    <Code className="h-5 w-5 mr-2" />
                                    Recent Submissions
                                </h2>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] [&::-webkit-scrollbar-thumb]:rounded dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f] [&::-webkit-scrollbar-thumb:hover]:bg-[#525252]">
                                {recentSubmissions.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No submissions yet
                                    </p>
                                ) : (
                                    recentSubmissions.map((submission) => (
                                        <Link
                                            key={submission.id}
                                            href={`/problems/${submission.problemSlug}`}
                                            className="block p-3 rounded-lg border hover:border-primary transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium group-hover:text-primary transition-colors">
                                                            {
                                                                submission.problemTitle
                                                            }
                                                        </h3>
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadgeColor(
                                                                submission.difficulty
                                                            )}`}
                                                        >
                                                            {
                                                                submission.difficulty
                                                            }
                                                        </span>
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                                submission.status ===
                                                                "ACCEPTED"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}
                                                        >
                                                            {submission.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Code className="h-3 w-3" />
                                                            {
                                                                submission.language
                                                            }
                                                        </span>
                                                        {submission.runtime && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {
                                                                    submission.runtime
                                                                }
                                                                ms
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(
                                                                submission.submittedAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <FooterSection />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedPage>
            <DashboardPageContent />
        </ProtectedPage>
    );
}
