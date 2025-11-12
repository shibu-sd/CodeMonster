"use client";

import React, { memo, useMemo, useCallback } from "react";
import type { LeaderboardTableProps } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
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

const LeaderboardRow = memo(({ user }: { user: any }) => {
    return (
        <tr
            className={`border-t border-border/50 hover:bg-muted/20 transition-all duration-200 group ${
                user.isCurrentUser ? "bg-primary/10" : ""
            }`}
        >
            <td className="py-5 px-6">{getRankBadge(user.rank)}</td>
            <td className="py-5 px-4">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                    <AvatarImage
                        src={user.profileImageUrl || undefined}
                        alt={user.username || user.firstName || "User"}
                    />
                    <AvatarFallback className="text-sm font-medium">
                        {(user.username || user.firstName || "User")
                            .slice(0, 2)
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </td>
            <td className="py-5 px-2">
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-base">
                            {user.username || user.firstName || "User"}
                        </span>
                        {user.isCurrentUser && (
                            <Badge variant="default" className="text-xs">
                                You
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </td>
            <td className="py-5 px-6 text-center">
                <span className="font-bold text-base">
                    {user.problemsSolved.toLocaleString()}
                </span>
            </td>
            <td className="py-5 px-6 text-center">
                <span className="font-bold text-base text-primary">
                    {user.battlesWon.toLocaleString()}
                </span>
            </td>
            <td className="py-5 px-6 text-center">
                <span className="text-sm font-medium text-muted-foreground">
                    {user.totalSubmissions.toLocaleString()}
                </span>
            </td>
            <td className="py-5 px-6 text-center">
                <span
                    className={`text-sm font-bold ${getAcceptanceRateColor(
                        user.acceptanceRate
                    )}`}
                >
                    {formatAcceptanceRate(user.acceptanceRate)}
                </span>
            </td>
        </tr>
    );
});

LeaderboardRow.displayName = "LeaderboardRow";

export function LeaderboardTable({
    users,
    isLoading,
    pagination,
    onNextPage,
    onPrevPage,
}: LeaderboardTableProps) {
    if (isLoading) {
        return (
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-muted/80 to-muted/60">
                            <tr>
                                <th className="text-left py-4 px-6">
                                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                                </th>
                                <th className="text-left py-4 px-6" colSpan={2}>
                                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                                </th>
                                <th className="text-center py-4 px-6">
                                    <div className="h-4 w-16 bg-muted rounded animate-pulse mx-auto" />
                                </th>
                                <th className="text-center py-4 px-6">
                                    <div className="h-4 w-24 bg-muted rounded animate-pulse mx-auto" />
                                </th>
                                <th className="text-center py-4 px-6">
                                    <div className="h-4 w-24 bg-muted rounded animate-pulse mx-auto" />
                                </th>
                                <th className="text-center py-4 px-6">
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse mx-auto" />
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
                                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                                    </td>
                                    <td className="py-5 px-2">
                                        <div className="space-y-1">
                                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <div className="h-6 w-12 bg-muted rounded animate-pulse mx-auto" />
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <div className="h-6 w-12 bg-muted rounded animate-pulse mx-auto" />
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <div className="h-4 w-16 bg-muted rounded animate-pulse mx-auto" />
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
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
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-muted/80 to-muted/60">
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                Rank
                            </th>
                            <th
                                className="text-left py-4 px-6 font-semibold text-sm uppercase tracking-wide"
                                colSpan={2}
                            >
                                User
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                Solved
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                Battles Won
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                Submissions
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wide">
                                Acceptance
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <LeaderboardRow key={user.id} user={user} />
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 px-6 py-4 border-t bg-muted/20">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevPage}
                        disabled={!pagination.hasPrev}
                        className="transform hover:scale-105 transition-all duration-200"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNextPage}
                        disabled={!pagination.hasNext}
                        className="transform hover:scale-105 transition-all duration-200"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
