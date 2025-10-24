"use client";

import React from "react";
import type { LeaderboardStats as LeaderboardStatsType } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Target, TrendingUp } from "lucide-react";

interface LeaderboardStatsProps {
    stats: LeaderboardStatsType;
    isLoading?: boolean;
}

export function LeaderboardStats({ stats, isLoading }: LeaderboardStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="space-y-2">
                                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Participants",
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Problems Solved",
            value: stats.totalProblemsSolved.toLocaleString(),
            icon: Target,
            color: "text-green-500",
        },
        {
            title: "Average Solved",
            value: stats.averageProblemsSolved.toFixed(1),
            icon: TrendingUp,
            color: "text-purple-500",
        },
        {
            title: "Top Score",
            value: stats.topUserProblemsSolved.toLocaleString(),
            icon: Trophy,
            color: "text-yellow-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={index}
                        className="hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {card.title}
                                    </p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {card.value}
                                    </p>
                                </div>
                                <Icon className={`w-8 h-8 ${card.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
