"use client";

import React from "react";
import { HeroHeader } from "@/components/header/header";
import { HeroAnnouncement } from "./hero-announcement";
import { HeroContent } from "./hero-content";
import { HeroDemo } from "./hero-demo";
import { HeroPartners } from "./hero-partners";

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-24 md:pt-36">
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
