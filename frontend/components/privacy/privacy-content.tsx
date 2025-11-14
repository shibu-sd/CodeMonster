"use client";

import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { motion } from "motion/react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { PrivacySection } from "./privacy-section";
import { PRIVACY_SECTIONS } from "./privacy-data";

export default function PrivacyContent() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="container mx-auto px-6 pt-32 pb-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Your privacy is important to us. This policy explains
                        how we collect, use, and protect your information.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                        Last updated: October 25, 2025
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {PRIVACY_SECTIONS.map((section, index) => (
                        <PrivacySection
                            key={section.title}
                            title={section.title}
                            delay={0.1 + index * 0.05}
                        >
                            {section.content}
                        </PrivacySection>
                    ))}
                </div>
            </div>
            <FooterSection />
        </div>
    );
}
