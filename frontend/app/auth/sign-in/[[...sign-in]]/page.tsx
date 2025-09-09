import { SignIn } from "@clerk/nextjs";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";

export default function Page() {
    return (
        <div className="min-h-screen bg-background">
            <HeroHeader />
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 pt-20">
                <SignIn />
            </div>
            <FooterSection />
        </div>
    );
}
