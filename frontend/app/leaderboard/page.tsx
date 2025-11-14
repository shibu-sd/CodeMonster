"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    useApiWithAuth,
    type LeaderboardEntry,
    type LeaderboardStats,
} from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardStats as LeaderboardStatsComponent } from "@/components/leaderboard/leaderboard-stats";
import { LeaderboardSkeleton } from "@/components/skeletons/leaderboard/leaderboard-skeleton";
import { LeaderboardErrorState } from "@/components/leaderboard/leaderboard-error-state";
import { LeaderboardUserRankCard } from "@/components/leaderboard/leaderboard-user-rank-card";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import type { PaginationInfo } from "@/types";

function LeaderboardPageContent() {
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [authReady, setAuthReady] = useState(false);
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
    const [isLoading, setIsLoading] = useState(true);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Set page title
    useEffect(() => {
        document.title = "Leaderboard - CodeMonster";
    }, []);

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

    const loadLeaderboard = useCallback(
        async (page = 1) => {
            try {
                setIsLoading(true);
                setError(null);

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
        [isSignedIn, pagination.limit, api]
    );

    const loadStats = useCallback(async () => {
        try {
            setIsStatsLoading(true);

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
    }, [api]);

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

    // Parallelize API calls for faster loading
    useEffect(() => {
        if (authReady) {
            Promise.all([loadLeaderboard(), loadStats()]);
        }
    }, [authReady, loadLeaderboard, loadStats]);

    if (isLoading || isStatsLoading) {
        return <LeaderboardSkeleton />;
    }

    if (error) {
        return (
            <LeaderboardErrorState
                error={error}
                onRetry={() => loadLeaderboard()}
            />
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
                        </div>
                    </div>

                    {stats && (
                        <LeaderboardStatsComponent
                            stats={stats}
                            isLoading={isStatsLoading}
                        />
                    )}

                    {isSignedIn && currentUserRank && currentUserRank > 50 && (
                        <LeaderboardUserRankCard rank={currentUserRank} />
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
    return <LeaderboardPageContent />;
}
