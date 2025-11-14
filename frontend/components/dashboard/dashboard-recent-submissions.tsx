import { Code, Clock, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { getDifficultyBadgeColor } from "@/lib/api";
import type { DashboardData } from "@/types";

interface DashboardRecentSubmissionsProps {
    recentSubmissions: DashboardData["recentSubmissions"];
}

export const DashboardRecentSubmissions = memo(function DashboardRecentSubmissions({
    recentSubmissions,
}: DashboardRecentSubmissionsProps) {
    return (
        <div className="bg-card rounded-xl border shadow-lg p-6 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <Code className="h-5 w-5 text-primary" />
                    </div>
                    Recent Submissions
                </h2>
            </div>
            <div className="space-y-2 overflow-y-auto pr-2 flex-1 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] [&::-webkit-scrollbar-thumb]:rounded dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f] [&::-webkit-scrollbar-thumb:hover]:bg-[#525252]">
                {recentSubmissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No submissions yet
                    </p>
                ) : (
                    recentSubmissions.map(
                        (
                            submission: DashboardData["recentSubmissions"][number]
                        ) => (
                            <Link
                                key={submission.id}
                                href={`/problems/${submission.problemSlug}`}
                                className="block p-3 rounded-lg border border-border hover:border-primary transition-all duration-200 group hover:shadow-md bg-muted/20 hover:bg-muted/40"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                                {submission.problemTitle}
                                            </h3>
                                            <span
                                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${getDifficultyBadgeColor(
                                                    submission.difficulty
                                                )}`}
                                            >
                                                {submission.difficulty}
                                            </span>
                                            <span
                                                className={`text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ${
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
                                            <span className="flex items-center gap-1 font-medium">
                                                <Code className="h-3 w-3" />
                                                {submission.language}
                                            </span>
                                            {submission.runtime && (
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Clock className="h-3 w-3" />
                                                    {submission.runtime}ms
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 font-medium">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(
                                                    submission.submittedAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                                </div>
                            </Link>
                        )
                    )
                )}
            </div>
        </div>
    );
});
