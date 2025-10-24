import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProblemErrorStateProps {
    error: string | null;
    onGoBack: () => void;
}

export function ProblemErrorState({ error, onGoBack }: ProblemErrorStateProps) {
    return (
        <div className="min-h-screen bg-background">
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
                            <Button onClick={onGoBack}>
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