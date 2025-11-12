import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";

interface ProblemsErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function ProblemsErrorState({
    error,
    onRetry,
}: ProblemsErrorStateProps) {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />

            <HeroHeader />
            <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">❌</div>
                        <h2 className="text-2xl font-bold mb-2">
                            Error Loading Problems
                        </h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={onRetry}>Try Again</Button>
                    </div>
                </div>
            </div>
            <FooterSection />
        </div>
    );
}
