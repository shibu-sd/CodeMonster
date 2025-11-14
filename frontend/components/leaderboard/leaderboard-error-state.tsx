import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";

interface LeaderboardErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function LeaderboardErrorState({
    error,
    onRetry,
}: LeaderboardErrorStateProps) {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="text-center space-y-4">
                    <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
                    <p className="text-destructive">{error}</p>
                    <Button onClick={onRetry}>Try Again</Button>
                </div>
            </div>
            <FooterSection />
        </div>
    );
}
