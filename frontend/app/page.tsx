import { Metadata } from "next";
import HeroSection from "@/components/hero-section/hero-section";
import FooterSection from "@/components/footer/footer";
import { Testimonials } from "@/components/testimonials";
import { FaqsAccordion } from "@/components/faqs";

export const metadata: Metadata = {
    title: "CodeMonster - The Ultimate Coding Arena",
    description:
        "Solve algorithmic challenges, compete on leaderboards, and master DSA through real-time battles. Train your logic, track your progress, and evolve into an unstoppable coding monster.",
};

export default function Home() {
    return (
        <div>
            <HeroSection />
            <Testimonials />
            <FaqsAccordion />
            <FooterSection />
        </div>
    );
}
