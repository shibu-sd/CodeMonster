"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";

interface ProtectedPageProps {
    children: React.ReactNode;
    fallbackTitle?: string;
    fallbackMessage?: string;
}

export function ProtectedPage({
    children,
    fallbackTitle = "Authentication Required",
    fallbackMessage = "You need to sign in to access this content.",
}: ProtectedPageProps) {
    const { isLoaded, isSignedIn } = useAuth();

    // Show loading while auth is being determined
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    // Show auth required message if not authenticated
    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <div className="container mx-auto px-4 pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-yellow-500 mb-4 text-6xl">
                                🔒
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {fallbackTitle}
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {fallbackMessage}
                            </p>
                            <div className="space-x-4">
                                <Link href="/auth/sign-in">
                                    <Button>Sign In</Button>
                                </Link>
                                <Link href="/auth/sign-up">
                                    <Button variant="outline">Sign Up</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    // Render protected content
    return <>{children}</>;
}
