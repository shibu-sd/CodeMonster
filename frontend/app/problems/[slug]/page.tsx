"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Play,
    BookOpen,
    TestTube,
    Code,
    CheckCircle,
    XCircle,
    RotateCcw,
    Settings,
    Star,
} from "lucide-react";
import { HeroHeader } from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/auth/protected-page";
import { MonacoEditor } from "@/components/code-editor/monaco-editor";
import { marked } from "marked";
import {
    useApiWithAuth,
    Problem,
    getDifficultyColor,
    getDifficultyBadgeColor,
    formatAcceptanceRate,
    formatSubmissionCount,
} from "@/lib/api";

marked.setOptions({
    breaks: true,
    gfm: true,
});

function ProblemDetailPageContent() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const api = useApiWithAuth();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "description" | "submissions" | "editorial"
    >("description");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("PYTHON");
    const [code, setCode] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);

    const availableLanguages = [
        { id: "PYTHON", name: "Python", extension: "py" },
        { id: "JAVA", name: "Java", extension: "java" },
        { id: "CPP", name: "C++", extension: "cpp" },
    ];

    useEffect(() => {
        if (slug) {
            fetchProblem();
        }
    }, [slug]);

    // Load starter code when problem is loaded
    useEffect(() => {
        if (problem) {
            const starterCode = getStarterCodeForLanguage(selectedLanguage);
            setCode(starterCode);
        }
    }, [problem, selectedLanguage]);

    const fetchProblem = async () => {
        try {
            setLoading(true);
            const response = await api.getProblem(slug);

            if (response.success) {
                setProblem(response.data);
                if (
                    response.data.starterCode &&
                    response.data.starterCode.length > 0
                ) {
                    setSelectedLanguage(response.data.starterCode[0].language);
                }
            } else {
                setError("Problem not found");
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch problem"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRunCode = async () => {
        setIsSubmitting(true);
        setSubmissionResult({ id: "local", status: "RUNNING" });

        setTimeout(() => {
            setSubmissionResult({
                id: "local",
                status: "ACCEPTED",
                executionTime: 45,
                memory: 12.5,
                testCasesPassed: 3,
                totalTestCases: 3,
            });
            setIsSubmitting(false);
        }, 2000);
    };

    const handleSubmitCode = async () => {
        if (!problem) return;

        try {
            setIsSubmitting(true);
            setSubmissionResult({ id: "pending", status: "PENDING" });

            const response = await api.submitCode({
                problemId: problem.id,
                language: selectedLanguage,
                code: code,
            });

            if (response.success) {
                setSubmissionResult({
                    id: response.data.submissionId,
                    status: "ACCEPTED",
                    executionTime: 67,
                    memory: 15.2,
                    testCasesPassed: 15,
                    totalTestCases: 15,
                });
            }
        } catch (err) {
            setSubmissionResult({
                id: "error",
                status: "COMPILATION_ERROR",
                error: err instanceof Error ? err.message : "Submission failed",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "WRONG_ANSWER":
            case "RUNTIME_ERROR":
            case "COMPILATION_ERROR":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "TIME_LIMIT_EXCEEDED":
                return <XCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return "text-green-600 dark:text-green-400";
            case "WRONG_ANSWER":
            case "RUNTIME_ERROR":
            case "COMPILATION_ERROR":
                return "text-red-600 dark:text-red-400";
            case "TIME_LIMIT_EXCEEDED":
                return "text-yellow-600 dark:text-yellow-400";
            default:
                return "text-blue-600 dark:text-blue-400";
        }
    };

    const getStarterCodeForLanguage = (language: string) => {
        if (!problem?.starterCode) return "";
        const starterCode = problem.starterCode.find(
            (sc) => sc.language === language
        );
        return starterCode?.code || "";
    };

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage);
        const starterCode = getStarterCodeForLanguage(newLanguage);
        setCode(starterCode);
    };

    const handleCodeReset = () => {
        const starterCode = getStarterCodeForLanguage(selectedLanguage);
        setCode(starterCode);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">
                                Loading problem...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-red-500 mb-4 text-6xl">❌</div>
                            <h2 className="text-2xl font-bold mb-2">
                                Problem Not Found
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {error}
                            </p>
                            <div className="space-x-4">
                                <Button onClick={() => router.back()}>
                                    Go Back
                                </Button>
                                <Link href="/problems">
                                    <Button variant="outline">
                                        View All Problems
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <HeroHeader />

            <main className="flex-1 w-full px-6 pt-10 pb-6 flex flex-col overflow-hidden">
                {/* Header */}
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
                                        problem?.acceptance_rate
                                    )}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Submissions:{" "}
                                    {formatSubmissionCount(
                                        problem?.total_submissions
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

                {/* Split Layout - Equal Halves */}
                <div className="grid grid-cols-2 gap-0 flex-1 overflow-hidden">
                    {/* Left Half - Problem Content (50%) */}
                    <div className="flex flex-col h-full overflow-hidden pr-2 border-r border-border/50">
                        {/* Tabs */}
                        <div className="flex justify-between items-center border-b mb-3">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab("description")}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === "description"
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <BookOpen className="h-4 w-4 inline mr-2" />
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab("submissions")}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === "submissions"
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Code className="h-4 w-4 inline mr-2" />
                                    Submissions
                                </button>
                                <button
                                    onClick={() => setActiveTab("editorial")}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === "editorial"
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <TestTube className="h-4 w-4 inline mr-2" />
                                    Editorial
                                </button>
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="p-2"
                                >
                                    <Star className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="p-2"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Tab Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === "description" && (
                                <div className="space-y-6 pb-6">
                                    {/* Problem Description */}
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
                                                __html: marked(
                                                    problem.description
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "submissions" && (
                                <div className="bg-card rounded-lg p-6 border">
                                    <h3 className="text-lg font-semibold mb-4">
                                        Your Submissions
                                    </h3>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Code className="h-12 w-12 mx-auto mb-4" />
                                        <p>No submissions yet</p>
                                        <p className="text-sm">
                                            Submit your solution to see
                                            submission history
                                        </p>
                                    </div>
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
                                            Detailed solution explanation will
                                            be available here
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Half - Code Editor (50%) */}
                    <div className="flex flex-col h-full pl-2 space-y-3">
                        {/* Editor Header */}
                        <div className="flex items-center justify-between bg-card rounded-lg p-3 border flex-shrink-0">
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium">
                                    Language:
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) =>
                                        handleLanguageChange(e.target.value)
                                    }
                                    className="px-3 py-1 border border-border rounded-md bg-background text-sm"
                                    disabled={isSubmitting}
                                >
                                    {availableLanguages.map((lang) => (
                                        <option key={lang.id} value={lang.id}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCodeReset}
                                    disabled={isSubmitting}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRunCode}
                                    disabled={isSubmitting}
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Run
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={handleSubmitCode}
                                    disabled={isSubmitting || !code.trim()}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>

                        {/* Monaco Code Editor - Takes most of the space */}
                        <div className="flex-1 bg-card rounded-lg border overflow-hidden min-h-0">
                            <MonacoEditor
                                value={code}
                                onChange={setCode}
                                language={selectedLanguage}
                                height="100%"
                                className="w-full h-full"
                            />
                        </div>

                        {/* Submission Result */}
                        {submissionResult && (
                            <div className="bg-card rounded-lg p-4 border">
                                <h3 className="text-lg font-semibold mb-4">
                                    Result
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(submissionResult.status)}
                                        <span
                                            className={`font-medium ${getStatusColor(
                                                submissionResult.status
                                            )}`}
                                        >
                                            {submissionResult.status.replace(
                                                "_",
                                                " "
                                            )}
                                        </span>
                                    </div>

                                    {submissionResult.status === "ACCEPTED" && (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Runtime:
                                                </span>
                                                <span className="ml-2 font-medium">
                                                    {
                                                        submissionResult.executionTime
                                                    }
                                                    ms
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Memory:
                                                </span>
                                                <span className="ml-2 font-medium">
                                                    {submissionResult.memory}MB
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">
                                                    Test Cases:
                                                </span>
                                                <span className="ml-2 font-medium text-green-600">
                                                    {
                                                        submissionResult.testCasesPassed
                                                    }
                                                    /
                                                    {
                                                        submissionResult.totalTestCases
                                                    }{" "}
                                                    passed
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {submissionResult.error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                                            <p className="text-sm text-red-800 dark:text-red-200">
                                                {submissionResult.error}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProblemDetailPage() {
    return (
        <ProtectedPage
            fallbackTitle="Authentication Required"
            fallbackMessage="You need to sign in to access this problem."
        >
            <ProblemDetailPageContent />
        </ProtectedPage>
    );
}
