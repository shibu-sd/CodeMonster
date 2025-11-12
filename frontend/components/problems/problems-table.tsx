import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { memo } from "react";
import {
    Problem,
    getDifficultyBadgeColor,
    formatAcceptanceRate,
    formatSubmissionCount,
} from "@/lib/api";

interface ProblemsTableProps {
    problems: Problem[];
    solvedProblemIds: Set<string>;
    currentPage: number;
}

interface ProblemRowProps {
    problem: Problem;
    index: number;
    currentPage: number;
    isSolved: boolean;
}

const ProblemRow = memo(
    ({ problem, index, currentPage, isSolved }: ProblemRowProps) => {
        return (
            <tr className="border-t border-border/50 hover:bg-muted/20 transition-all duration-200 group">
                <td className="py-5 px-6">
                    <Link
                        href={`/problems/${problem?.slug || "unknown"}`}
                        className="hover:text-primary transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-muted-foreground min-w-[2rem]">
                                {(currentPage - 1) * 10 + index + 1}.
                            </span>
                            <span className="font-semibold text-base group-hover:underline">
                                {problem?.title || "Unknown Problem"}
                            </span>
                        </div>
                    </Link>
                </td>
                <td className="py-5 px-6 text-center">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getDifficultyBadgeColor(
                            problem?.difficulty || "EASY"
                        )}`}
                    >
                        {problem?.difficulty || "EASY"}
                    </span>
                </td>
                <td className="py-5 px-6 text-center">
                    <span className="text-sm font-medium">
                        {formatAcceptanceRate(problem?.acceptanceRate)}
                    </span>
                </td>
                <td className="py-5 px-6 text-center">
                    <span className="text-sm font-medium text-muted-foreground">
                        {formatSubmissionCount(problem?.totalSubmissions)}
                    </span>
                </td>
                <td className="py-5 px-6 text-center">
                    {isSolved && (
                        <div className="flex justify-center">
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    )}
                </td>
            </tr>
        );
    }
);

ProblemRow.displayName = "ProblemRow";

export function ProblemsTable({
    problems,
    solvedProblemIds,
    currentPage,
}: ProblemsTableProps) {
    return (
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
                            <ProblemRow
                                key={problem?.id || index}
                                problem={problem}
                                index={index}
                                currentPage={currentPage}
                                isSolved={solvedProblemIds.has(
                                    problem?.id || ""
                                )}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
