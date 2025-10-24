import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Problem } from "@/lib/api";
import {
    getDifficultyBadgeColor,
    formatAcceptanceRate,
    formatSubmissionCount,
} from "@/lib/api";

interface ProblemHeaderProps {
    problem: Problem;
}

export function ProblemHeader({ problem }: ProblemHeaderProps) {
    return (
        <div className="mb-3 px-2">
            <div className="flex items-center mb-4">
                <Link href="/problems">
                    <Button variant="ghost" size="sm" className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Problems
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                    {problem.title}
                </h1>
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                                problem.difficulty
                            )}`}
                        >
                            {problem.difficulty}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Acceptance Rate:{" "}
                            {formatAcceptanceRate(
                                problem?.acceptanceRate
                            )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Submissions:{" "}
                            {formatSubmissionCount(
                                problem?.totalSubmissions
                            )}
                        </span>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                        <div className="flex items-center space-x-2">
                            {problem.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}