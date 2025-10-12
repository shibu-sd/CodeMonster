"use client";

import React from "react";
import { HeroHeader } from "@/components/header/header";
import { HeroBackground } from "./hero-background";
import { HeroAnnouncement } from "./hero-announcement";
import { HeroContent } from "./hero-content";
import { HeroDemo } from "./hero-demo";
import { HeroPartners } from "./hero-partners";

export default function HeroSection() {

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <HeroBackground />
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
                        <div className="mx-auto max-w-7xl px-6">
                            <HeroAnnouncement />
                            <HeroContent />
                            <HeroDemo />
                        </div>
                    </div>
                </section>
                <HeroPartners />
            </main>
        </>
    );
}
