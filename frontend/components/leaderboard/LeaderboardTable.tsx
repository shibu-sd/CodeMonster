"use client";

import React from "react";
import type { LeaderboardEntry } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Medal,
    Award,
    ChevronLeft,
    ChevronRight,
    User,
} from "lucide-react";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface LeaderboardTableProps {
    users: LeaderboardEntry[];
    isLoading?: boolean;
    pagination?: PaginationInfo;
    onNextPage?: () => void;
    onPrevPage?: () => void;
}

export function LeaderboardTable({
    users,
    isLoading,
    pagination,
    onNextPage,
    onPrevPage,
}: LeaderboardTableProps) {
    const getRankBadge = (rank: number) => {
        if (rank === 1) {
            return (
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full">
                    <Trophy className="w-5 h-5 text-white" />
                </div>
            );
        } else if (rank === 2) {
            return (
                <div className="flex items-center justify-center w-8 h-8 bg-gray-400 rounded-full">
                    <Medal className="w-5 h-5 text-white" />
                </div>
            );
        } else if (rank === 3) {
            return (
                <div className="flex items-center justify-center w-8 h-8 bg-amber-600 rounded-full">
                    <Award className="w-5 h-5 text-white" />
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                    <span className="text-sm font-semibold text-muted-foreground">
                        {rank}
                    </span>
                </div>
            );
        }
    };

    const getAcceptanceRateColor = (rate: number) => {
        if (rate >= 70) return "text-green-600 dark:text-green-400";
        if (rate >= 50) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const formatAcceptanceRate = (rate: number) => {
        return `${rate.toFixed(1)}%`;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>Leaderboard</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-4 p-3"
                            >
                                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                                </div>
                                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!users || users.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        No rankings yet
                    </h3>
                    <p className="text-muted-foreground">
                        Be the first to start solving problems and appear on the
                        leaderboard!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Rankings</span>
                    {pagination && (
                        <Badge variant="secondary" className="ml-2">
                            {pagination.total.toLocaleString()} participants
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="flex items-center space-x-4 p-3 text-sm font-medium text-muted-foreground border-b">
                        <div className="w-8 text-center">Rank</div>
                        <div className="w-10">User</div>
                        <div className="flex-1">Username</div>
                        <div className="w-20 text-center">Solved</div>
                        <div className="w-28 text-center whitespace-nowrap">
                            Battles Won
                        </div>
                        <div className="w-24 text-center">Submissions</div>
                        <div className="w-20 text-center">Acceptance</div>
                    </div>

                    {users.map((user) => (
                        <div
                            key={user.id}
                            className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                                user.isCurrentUser
                                    ? "bg-primary/5 border border-primary/20"
                                    : ""
                            }`}
                        >
                            <div className="w-8 flex justify-center">
                                {getRankBadge(user.rank)}
                            </div>
                            <div className="w-10">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage
                                        src={user.profileImageUrl || undefined}
                                        alt={
                                            user.username ||
                                            user.firstName ||
                                            "User"
                                        }
                                    />
                                    <AvatarFallback className="text-xs">
                                        {(
                                            user.username ||
                                            user.firstName ||
                                            "User"
                                        )
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium text-foreground">
                                        {user.username ||
                                            user.firstName ||
                                            "User"}
                                    </span>
                                    {user.isCurrentUser && (
                                        <Badge
                                            variant="default"
                                            className="text-xs"
                                        >
                                            You
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Joined{" "}
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="w-20 text-center">
                                <div className="font-semibold text-foreground">
                                    {user.problemsSolved.toLocaleString()}
                                </div>
                            </div>

                            <div className="w-28 text-center">
                                <div className="font-semibold text-primary">
                                    {user.battlesWon.toLocaleString()}
                                </div>
                            </div>

                            <div className="w-24 text-center">
                                <div className="text-sm text-muted-foreground">
                                    {user.totalSubmissions.toLocaleString()}
                                </div>
                            </div>

                            <div className="w-20 text-center">
                                <div
                                    className={`text-sm font-medium ${getAcceptanceRateColor(
                                        user.acceptanceRate
                                    )}`}
                                >
                                    {formatAcceptanceRate(user.acceptanceRate)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-6 pt-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPrevPage}
                            disabled={!pagination.hasPrev}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onNextPage}
                            disabled={!pagination.hasNext}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
