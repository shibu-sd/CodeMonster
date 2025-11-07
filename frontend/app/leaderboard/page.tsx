"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    useApiWithAuth,
    type LeaderboardEntry,
    type LeaderboardStats,
} from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { Trophy, Users, Target, TrendingUp } from "lucide-react";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { ProtectedPage } from "@/components/auth/protected-page";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeaderboardStats as LeaderboardStatsComponent } from "@/components/leaderboard/LeaderboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

function LeaderboardPageContent() {
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [authReady, setAuthReady] = useState(false);

    // State for leaderboard data
    const [users, setUsers] = useState<LeaderboardEntry[]>([]);
    const [stats, setStats] = useState<LeaderboardStats | null>(null);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const skeletonStartTime = useRef<number>(Date.now());

    // Initialize authentication
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

    // Load leaderboard data
    const loadLeaderboard = useCallback(
        async (page = 1) => {
            try {
                setIsLoading(true);
                setError(null);

                if (isSignedIn) {
                    const token = await getToken();
                    if (token) {
                        api.setAuthToken(token);
                    }
                }

                const response = await api.getLeaderboard({
                    page,
                    limit: pagination.limit,
                });

                if (response.success) {
                    setUsers(response.data.users);
                    setPagination(response.data.pagination);

                    if (isSignedIn) {
                        const userInLeaderboard = response.data.users.find(
                            (u) => u.isCurrentUser
                        );
                        if (!userInLeaderboard) {
                            try {
                                const rankResponse = await api.getUserRank();
                                if (rankResponse.success) {
                                    setCurrentUserRank(rankResponse.data.rank);
                                }
                            } catch (rankError) {
                                console.error(
                                    "Failed to get user rank:",
                                    rankError
                                );
                            }
                        } else {
                            setCurrentUserRank(userInLeaderboard.rank);
                        }
                    }
                } else {
                    setError("Failed to load leaderboard data");
                }
            } catch (err) {
                console.error("Error loading leaderboard:", err);
                setError("Network error. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [isSignedIn, pagination.limit]
    );

    const loadStats = useCallback(async () => {
        try {
            setIsStatsLoading(true);

            if (isSignedIn) {
                const token = await getToken();
                if (token) {
                    api.setAuthToken(token);
                }
            }

            const response = await api.getLeaderboardStats();

            if (response.success) {
                setStats(response.data);
            } else {
                console.error("Failed to load stats");
            }
        } catch (err) {
            console.error("Error loading stats:", err);
        } finally {
            setIsStatsLoading(false);
        }
    }, [isSignedIn]);

    const handleNextPage = () => {
        if (pagination.hasNext) {
            loadLeaderboard(pagination.page + 1);
        }
    };

    const handlePrevPage = () => {
        if (pagination.hasPrev) {
            loadLeaderboard(pagination.page - 1);
        }
    };

    useEffect(() => {
        if (authReady) {
            loadLeaderboard();
            loadStats();
        }
    }, [authReady, loadLeaderboard, loadStats]);

    useEffect(() => {
        if (!isLoading && !isStatsLoading && showSkeleton) {
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
    }, [isLoading, isStatsLoading, showSkeleton]);

    if (showSkeleton) {
        return (
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />

                <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    <div className="space-y-8">
                        <div className="mb-8">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center items-center">
                                    <Skeleton className="h-10 w-48" />
                                </div>
                                <Skeleton className="h-6 w-96 mx-auto" />
                                <div className="flex justify-center items-center space-x-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-muted/20 rounded-xl p-6 border shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-9 w-9 rounded-lg" />
                                    </div>
                                    <Skeleton className="h-9 w-16 mx-auto" />
                                </div>
                            ))}
                        </div>

                        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-muted/80 to-muted/60">
                                        <tr>
                                            <th className="text-left py-4 px-6">
                                                <Skeleton className="h-4 w-12" />
                                            </th>
                                            <th
                                                className="text-left py-4 px-6"
                                                colSpan={2}
                                            >
                                                <Skeleton className="h-4 w-16" />
                                            </th>
                                            <th className="text-center py-4 px-6">
                                                <Skeleton className="h-4 w-16 mx-auto" />
                                            </th>
                                            <th className="text-center py-4 px-6">
                                                <Skeleton className="h-4 w-24 mx-auto" />
                                            </th>
                                            <th className="text-center py-4 px-6">
                                                <Skeleton className="h-4 w-24 mx-auto" />
                                            </th>
                                            <th className="text-center py-4 px-6">
                                                <Skeleton className="h-4 w-20 mx-auto" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                            <tr
                                                key={i}
                                                className="border-t border-border/50"
                                            >
                                                <td className="py-5 px-6">
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                </td>
                                                <td className="py-5 px-4">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                </td>
                                                <td className="py-5 px-2">
                                                    <div className="space-y-1">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <Skeleton className="h-6 w-12 mx-auto" />
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <Skeleton className="h-6 w-12 mx-auto" />
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <Skeleton className="h-4 w-16 mx-auto" />
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <Skeleton className="h-4 w-12 mx-auto" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-10 w-16" />
                        </div>
                    </div>
                </main>

                <FooterSection />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />
                <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    <div className="text-center space-y-4">
                        <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
                        <p className="text-destructive">{error}</p>
                        <Button onClick={() => loadLeaderboard()}>
                            Try Again
                        </Button>
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />

            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="space-y-8">
                    <div className="mb-8">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center items-center space-x-3">
                                <h1 className="text-4xl font-bold text-foreground">
                                    Leaderboard
                                </h1>
                            </div>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Competition never sleeps and neither do the
                                monsters
                            </p>
                            <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
                                <Target className="w-4 h-4" />
                                <span>Ranked by total problems solved</span>
                            </div>
                        </div>
                    </div>

                    {stats && (
                        <LeaderboardStatsComponent
                            stats={stats}
                            isLoading={isStatsLoading}
                        />
                    )}

                    {isSignedIn && currentUserRank && currentUserRank > 50 && (
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/30 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-primary mb-2">
                                        Your Rank
                                    </h3>
                                    <p className="text-4xl font-bold text-primary">
                                        #{currentUserRank}
                                    </p>
                                </div>
                                <div className="p-3 bg-primary/20 rounded-lg">
                                    <Trophy className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                        </div>
                    )}

                    <LeaderboardTable
                        users={users}
                        isLoading={isLoading}
                        pagination={pagination}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                    />

                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={handlePrevPage}
                                disabled={!pagination.hasPrev || isLoading}
                            >
                                Previous
                            </Button>
                            <span className="py-2 px-4 text-sm text-muted-foreground">
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={handleNextPage}
                                disabled={!pagination.hasNext || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <FooterSection />
        </div>
    );
}

export default function LeaderboardPage() {
    return (
        <ProtectedPage
            fallbackTitle="Authentication Required"
            fallbackMessage="You need to sign in to access the leaderboard."
        >
            <LeaderboardPageContent />
        </ProtectedPage>
    );
}
