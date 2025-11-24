import { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";

export const metadata: Metadata = {
    title: "Sign In - CodeMonster",
    description: "Sign in to your CodeMonster account to continue coding.",
};

export default function Page() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 pt-20 relative z-10">
                <div className="bg-background rounded-lg p-1">
                    <SignIn />
                </div>
            </div>
            <FooterSection />
        </div>
    );
}
