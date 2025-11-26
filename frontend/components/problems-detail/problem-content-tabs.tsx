import { Button } from "@/components/ui/button";
import {
    BookOpen,
    TestTube,
    CheckCircle,
    Star,
    Settings,
    Terminal,
    ArrowRightCircle,
    AlertCircle,
    Code,
    Shield,
} from "lucide-react";
import { Problem } from "@/lib/api";
import { marked } from "marked";
import { CodeBlock } from "@/components/ui/code-block";

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
    isBattleMode?: boolean;
}

function ProblemDescriptionContent({ description }: { description: string }) {
    const cleanedContent = removeExamplesFromDescription(description);
    const parsedContent = marked.parse(cleanedContent, { async: false });
    const originalParsedContent = marked.parse(description, { async: false });

    return (
        <div className="space-y-6">
            <section className="space-y-6">
                <div
                    className="prose prose-gray dark:prose-invert max-w-none
                        prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground prose-p:mb-6
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-em:text-muted-foreground
                        prose-headings:text-foreground prose-headings:font-semibold
                        prose-h1:text-2xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:border-b prose-h1:border-border prose-h1:pb-3
                        prose-h2:text-xl prose-h2:mb-5 prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                        prose-h3:text-lg prose-h3:mb-4 prose-h3:mt-6
                        prose-ul:space-y-3 prose-ol:space-y-3
                        prose-li:text-foreground prose-li:leading-relaxed prose-li:mb-2
                        prose-pre:bg-muted prose-pre:border prose-pre:p-4 prose-pre:rounded-lg prose-pre:mb-6
                        prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                        prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                        [&>*]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: parsedContent }}
                />
            </section>

            <section className="space-y-4">
                <div className="bg-muted/50 rounded-lg border p-6">
                    <div className="flex items-center gap-3 text-base font-semibold text-foreground mb-4">
                        <Terminal className="h-5 w-5 text-muted-foreground" />
                        Input Format
                    </div>
                    <div className="text-sm text-foreground leading-relaxed space-y-4">
                        <p>The input is read from standard input (stdin).</p>
                        <div
                            className="prose prose-sm max-w-none dark:prose-invert prose-p:text-foreground"
                            dangerouslySetInnerHTML={{
                                __html: extractSectionFromContent(
                                    originalParsedContent,
                                    ["input", "input format", "input:"]
                                ),
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="bg-muted/50 rounded-lg border p-6">
                    <div className="flex items-center gap-3 text-base font-semibold text-foreground mb-4">
                        <ArrowRightCircle className="h-5 w-5 text-muted-foreground" />
                        Output Format
                    </div>
                    <div className="text-sm text-foreground leading-relaxed space-y-4">
                        <p>Print the output to standard output (stdout).</p>
                        <div
                            className="prose prose-sm max-w-none dark:prose-invert prose-p:text-foreground"
                            dangerouslySetInnerHTML={{
                                __html: extractSectionFromContent(
                                    originalParsedContent,
                                    ["output", "output format", "output:"]
                                ),
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="bg-muted/50 rounded-lg border p-6">
                    <div className="flex items-center gap-3 text-base font-semibold text-foreground mb-6">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        Examples
                    </div>
                    <div className="space-y-8">
                        {extractExamplesFromContent(originalParsedContent).map(
                            (example, index) => (
                                <div key={index} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <span className="bg-background border px-3 py-1 rounded text-xs font-mono">
                                                    Input
                                                </span>
                                            </div>
                                            <div className="bg-background border rounded-lg p-5 font-mono text-sm">
                                                <pre className="whitespace-pre-wrap leading-relaxed">
                                                    {example.input}
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <span className="bg-background border px-3 py-1 rounded text-xs font-mono">
                                                    Output
                                                </span>
                                            </div>
                                            <div className="bg-background border rounded-lg p-5 font-mono text-sm">
                                                <pre className="whitespace-pre-wrap leading-relaxed">
                                                    {example.output}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                    {example.explanation && (
                                        <div className="pt-6 border-t border-border">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                                                <AlertCircle className="h-4 w-4" />
                                                Explanation
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {example.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="bg-muted/50 rounded-lg border p-6">
                    <div className="flex items-center gap-3 text-base font-semibold text-foreground mb-6">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        Constraints
                    </div>
                    <div className="space-y-4">
                        {extractConstraintsFromContent(
                            originalParsedContent
                        ).map((constraint, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-6 h-6 bg-background border text-muted-foreground rounded flex items-center justify-center text-xs font-mono font-semibold">
                                    {index + 1}
                                </span>
                                <span className="text-sm text-foreground leading-relaxed pt-0.5">
                                    {constraint}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function removeExamplesFromDescription(description: string): string {
    const lines = description.split("\n");
    const cleanedLines: string[] = [];
    let skipSection = false;
    let currentSection = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
            .toLowerCase()
            .replace(/<[^>]*>/g, "")
            .trim();

        if (
            line.includes("example") ||
            line.includes("sample") ||
            line.includes("test case")
        ) {
            skipSection = true;
            currentSection = "example";
            continue;
        }

        if (line.includes("constraint") || line.includes("limit")) {
            skipSection = true;
            currentSection = "constraint";
            continue;
        }

        if (
            line.includes("input format") ||
            line.includes("output format") ||
            line.includes("time limit") ||
            line.includes("memory limit")
        ) {
            skipSection = true;
            currentSection = "other";
            continue;
        }

        if (skipSection && line.length > 0 && line[0] === "#") {
            skipSection = false;
            currentSection = "";
            cleanedLines.push(lines[i]);
            continue;
        }

        if (!skipSection) {
            cleanedLines.push(lines[i]);
        }
    }

    return cleanedLines.join("\n");
}

function extractSectionFromContent(
    content: string,
    keywords: string[]
): string {
    const lines = content.split("\n");
    let inSection = false;
    let sectionContent = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        const plainLine = lines[i].replace(/<[^>]*>/g, "").toLowerCase();

        if (keywords.some((keyword) => plainLine.includes(keyword))) {
            inSection = true;
            continue;
        }

        if (
            inSection &&
            (plainLine.includes("example") ||
                plainLine.includes("constraint") ||
                plainLine.includes("output") ||
                plainLine.includes("sample") ||
                (plainLine.length > 0 && plainLine[0] === "#"))
        ) {
            break;
        }

        if (inSection && line.trim()) {
            sectionContent += line + "\n";
        }
    }

    return (
        sectionContent ||
        "<p>Check the problem statement above for detailed input requirements.</p>"
    );
}

function extractExamplesFromContent(
    content: string
): Array<{ input: string; output: string; explanation?: string }> {
    const examples: Array<{
        input: string;
        output: string;
        explanation?: string;
    }> = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().replace(/<[^>]*>/g, "");
        if (line.includes("example") || line.includes("sample")) {
            let inputContent = "";
            let outputContent = "";
            let explanationContent = "";

            for (let j = i + 1; j < lines.length; j++) {
                const currentLine = lines[j]
                    .toLowerCase()
                    .replace(/<[^>]*>/g, "");
                if (
                    currentLine.includes("input") ||
                    currentLine.includes("sample input")
                ) {
                    j++;
                    while (
                        j < lines.length &&
                        !lines[j].toLowerCase().includes("output") &&
                        !lines[j].toLowerCase().includes("sample output")
                    ) {
                        const trimmedLine = lines[j].trim();

                        // Skip explanatory text and look for actual input data
                        if (
                            trimmedLine &&
                            !lines[j].toLowerCase().includes("explanation") &&
                            !lines[j].toLowerCase().includes("format") &&
                            !lines[j].toLowerCase().includes("constraint") &&
                            !lines[j].toLowerCase().includes("note") &&
                            !lines[j].toLowerCase().includes("remember") &&
                            !trimmedLine.toLowerCase().startsWith("the") &&
                            !trimmedLine.toLowerCase().startsWith("input") &&
                            !trimmedLine.toLowerCase().startsWith("you") &&
                            !trimmedLine.toLowerCase().startsWith("given") &&
                            !trimmedLine.toLowerCase().includes("must") &&
                            !trimmedLine.toLowerCase().includes("should") &&
                            !trimmedLine.toLowerCase().includes("only")
                        ) {
                            if (isValidInputLine(trimmedLine)) {
                                inputContent +=
                                    lines[j].replace(/<[^>]*>/g, "") + "\n";
                            }
                        }
                        j++;
                    }
                    i = j - 1;
                    break;
                }
            }

            for (let j = i + 1; j < lines.length; j++) {
                const currentLine = lines[j]
                    .toLowerCase()
                    .replace(/<[^>]*>/g, "");
                if (
                    currentLine.includes("output") ||
                    currentLine.includes("sample output")
                ) {
                    j++;
                    while (
                        j < lines.length &&
                        !lines[j].toLowerCase().includes("input") &&
                        !lines[j].toLowerCase().includes("example") &&
                        !lines[j].toLowerCase().includes("constraint")
                    ) {
                        const trimmedLine = lines[j].trim();

                        if (
                            trimmedLine &&
                            !lines[j].toLowerCase().includes("explanation") &&
                            !lines[j].toLowerCase().includes("format") &&
                            !lines[j].toLowerCase().includes("note") &&
                            !trimmedLine.toLowerCase().startsWith("the") &&
                            !trimmedLine.toLowerCase().startsWith("output") &&
                            !trimmedLine.toLowerCase().startsWith("you") &&
                            !trimmedLine.toLowerCase().startsWith("print")
                        ) {
                            if (isValidOutputLine(trimmedLine)) {
                                outputContent +=
                                    lines[j].replace(/<[^>]*>/g, "") + "\n";
                            }
                        }
                        j++;
                    }
                    i = j - 1;
                    break;
                }
            }

            if (inputContent.trim() || outputContent.trim()) {
                examples.push({
                    input: inputContent.trim() || "See problem statement",
                    output: outputContent.trim() || "See problem statement",
                });
            }
        }
    }

    return examples.length > 0 ? examples : [];
}

function isValidInputLine(line: string): boolean {
    return (
        // Numbers (common in input)
        /^\d+(\s+\d+)*$/.test(line) ||
        // Simple strings without explanatory words
        (/^[a-zA-Z0-9\s]+$/.test(line) && !containsExplanatoryWords(line)) ||
        // Code-like patterns
        /^[a-zA-Z][a-zA-Z0-9_]*$/.test(line) ||
        // Comma-separated values
        /^[^,]+(,[^,]+)*$/.test(line) ||
        // Array-like syntax
        /^\[[^\]]+\]$/.test(line) ||
        // Brackets/parentheses content
        /^[{}()<>[\]]+$/.test(line) ||
        // Mixed alphanumeric content
        /^[a-zA-Z0-9\s\{\}\(\)\[\]<>]+$/.test(line)
    );
}

function isValidOutputLine(line: string): boolean {
    return (
        // Numbers
        /^\d+(\s+\d+)*$/.test(line) ||
        // Simple strings
        (/^[a-zA-Z0-9\s]+$/.test(line) && !containsExplanatoryWords(line)) ||
        // Single words or short phrases
        /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/.test(line) ||
        // Boolean values
        /^(true|false|yes|no)$/i.test(line) ||
        // Array-like output
        /^\[[^\]]+\]$/.test(line) ||
        // Brackets content (like parentheses problems)
        /^[{}()<>[\]]+$/.test(line)
    );
}

function containsExplanatoryWords(line: string): boolean {
    const explanatoryWords = [
        "the",
        "is",
        "are",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "with",
        "by",
        "from",
        "up",
        "about",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        "between",
        "among",
        "must",
        "should",
        "could",
        "would",
        "might",
        "can",
        "will",
        "just",
        "only",
        "also",
        "even",
        "very",
        "really",
        "quite",
        "rather",
        "somewhat",
        "some",
        "any",
        "every",
        "each",
        "both",
        "few",
        "many",
        "several",
        "all",
        "any",
        "no",
        "none",
        "first",
        "second",
        "third",
        "last",
        "next",
        "previous",
        "following",
        "input",
        "output",
        "example",
        "sample",
        "test",
        "case",
        "problem",
        "solution",
        "answer",
        "result",
        "format",
        "structure",
        "type",
        "kind",
        "way",
        "method",
        "approach",
        "technique",
        "algorithm",
        "program",
    ];

    const lowerLine = line.toLowerCase();
    return explanatoryWords.some((word) => lowerLine.includes(word));
}

function extractConstraintsFromContent(content: string): string[] {
    const constraints: string[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().replace(/<[^>]*>/g, "");
        if (line.includes("constraint") || line.includes("limit")) {
            i++;
            while (
                i < lines.length &&
                lines[i].trim() &&
                !lines[i].toLowerCase().includes("example") &&
                !lines[i].toLowerCase().includes("output")
            ) {
                const constraint = lines[i].replace(/<[^>]*>/g, "").trim();
                if (
                    constraint &&
                    !constraint.toLowerCase().includes("constraint")
                ) {
                    constraints.push(constraint);
                }
                i++;
            }
        }
    }

    return constraints.length > 0
        ? constraints
        : [
              "1 ≤ N ≤ 10^5",
              "1 ≤ elements ≤ 10^9",
              "Time Limit: 1 second",
              "Memory Limit: 256 MB",
          ];
}

export function ProblemContentTabs({
    problem,
    activeTab,
    onTabChange,
    acceptedSolution,
    isBattleMode = false,
}: ProblemContentTabsProps) {
    return (
        <div className="flex flex-col h-full">
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
                    {!isBattleMode && (
                        <>
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
                        </>
                    )}
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

            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f]">
                    {activeTab === "description" && (
                        <div className="space-y-8 pb-8">
                            <div className="bg-card rounded-xl border shadow-sm">
                                <div className="p-8">
                                    <ProblemDescriptionContent
                                        description={problem.description}
                                    />
                                </div>
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
                                    <div className="mb-4 text-sm text-muted-foreground">
                                        Solved on{" "}
                                        {new Date(
                                            acceptedSolution.solvedAt
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                    <CodeBlock
                                        language={acceptedSolution.language.toLowerCase()}
                                        filename={`solution.${
                                            acceptedSolution.language ===
                                            "PYTHON"
                                                ? "py"
                                                : acceptedSolution.language ===
                                                  "JAVA"
                                                ? "java"
                                                : acceptedSolution.language ===
                                                  "CPP"
                                                ? "cpp"
                                                : "txt"
                                        }`}
                                        code={acceptedSolution.code}
                                    />
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
                                    Detailed solution explanation will be
                                    available here
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
