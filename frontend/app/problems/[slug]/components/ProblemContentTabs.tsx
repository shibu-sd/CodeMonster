import { Button } from "@/components/ui/button";
import { BookOpen, TestTube, Code, CheckCircle, Star, Settings } from "lucide-react";
import { Problem } from "@/lib/api";
import { marked } from "marked";

marked.setOptions({
    breaks: true,
    gfm: true,
});

interface ProblemContentTabsProps {
    problem: Problem;
    activeTab: "description" | "submissions" | "editorial";
    onTabChange: (tab: "description" | "submissions" | "editorial") => void;
    acceptedSolution: {
        code: string;
        language: string;
        runtime: number;
        memory: number;
        solvedAt: string;
    } | null;
    onCodeLoad: (code: string, language: string) => void;
}

export function ProblemContentTabs({
    problem,
    activeTab,
    onTabChange,
    acceptedSolution,
    onCodeLoad,
}: ProblemContentTabsProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Tabs Header */}
            <div className="flex justify-between items-center border-b mb-3 flex-shrink-0">
                <div className="flex">
                    <button
                        onClick={() => onTabChange("description")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === "description"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <BookOpen className="h-4 w-4" />
                        Description
                    </button>
                    <button
                        onClick={() => onTabChange("submissions")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === "submissions"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Code className="h-4 w-4" />
                        Submissions
                    </button>
                    <button
                        onClick={() => onTabChange("editorial")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === "editorial"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <TestTube className="h-4 w-4" />
                        Editorial
                    </button>
                </div>

                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="p-2">
                        <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tab Content - Scrollable with custom scrollbar */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f]">
                    {activeTab === "description" && (
                        <div className="space-y-6 pb-6">
                            <div className="bg-card rounded-lg p-6 border">
                                <div
                                    className="prose prose-sm max-w-none dark:prose-invert
                                        [&>p]:mb-4 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base
                                        [&>strong]:font-semibold [&>strong]:text-foreground
                                        [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-md [&>pre]:border
                                        [&>code]:bg-muted [&>code]:px-2 [&>code]:py-1 [&>code]:rounded
                                        [&>ul]:pl-6 [&>ol]:pl-6 [&>li]:mb-2
                                        [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4"
                                    dangerouslySetInnerHTML={{
                                        __html: marked(problem.description),
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "submissions" && (
                        <div className="space-y-4">
                            {acceptedSolution ? (
                                <div className="bg-card rounded-lg p-6 border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            Your Accepted Solution
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Code className="h-4 w-4" />
                                                {acceptedSolution.language}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ⚡ {acceptedSolution.runtime} ms
                                            </span>
                                            <span className="flex items-center gap-1">
                                                💾 {acceptedSolution.memory} MB
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-3 text-sm text-muted-foreground">
                                        Solved on{" "}
                                        {new Date(
                                            acceptedSolution.solvedAt
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )}
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-sm">
                                            <code>{acceptedSolution.code}</code>
                                        </pre>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => {
                                            onCodeLoad(acceptedSolution.code, acceptedSolution.language);
                                        }}
                                    >
                                        Load in Editor
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-card rounded-lg p-6 border">
                                    <h3 className="text-lg font-semibold mb-4">
                                        Your Submissions
                                    </h3>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Code className="h-12 w-12 mx-auto mb-4" />
                                        <p>No accepted solution yet</p>
                                        <p className="text-sm">
                                            Submit your solution to see it here
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "editorial" && (
                        <div className="bg-card rounded-lg p-6 border">
                            <h3 className="text-lg font-semibold mb-4">
                                Editorial
                            </h3>
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-4" />
                                <p>Editorial coming soon</p>
                                <p className="text-sm">
                                    Detailed solution explanation will be available here
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}