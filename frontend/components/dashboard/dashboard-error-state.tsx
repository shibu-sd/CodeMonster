import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/header/header";
import { DotPattern } from "@/components/ui/dot-pattern";

interface DashboardErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function DashboardErrorState({
    error,
    onRetry,
}: DashboardErrorStateProps) {
    return (
        <div className="min-h-screen flex flex-col relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="flex-1 flex items-center justify-center pt-20 relative z-10">
                <div className="text-center max-w-md mx-auto px-4">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                    <p className="text-lg font-medium mb-2">
                        Failed to load dashboard
                    </p>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    {error?.includes("Cannot connect") && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-left">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                🔧 Server Connection Issue
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                                The backend server is not responding. Please
                                make sure:
                            </p>
                            <ul className="text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                                <li>
                                    Server is running:{" "}
                                    <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                                        cd server && npm run dev
                                    </code>
                                </li>
                                <li>
                                    Server is accessible at the configured URL
                                </li>
                                <li>
                                    Your network connection is working (if using
                                    remote server)
                                </li>
                            </ul>
                        </div>
                    )}
                    <Button onClick={onRetry} variant="default">
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}
