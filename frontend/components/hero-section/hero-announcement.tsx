import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: "blur(12px)",
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
};

export const HeroAnnouncement: React.FC = () => {
    return (
        <AnimatedGroup
            variants={transitionVariants}
            className="pointer-events-auto"
        >
            <Link
                href="/battle"
                className="group mx-auto flex w-fit items-center gap-3 rounded-full border border-neutral-200 bg-white/50 px-4 py-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-xl dark:border-neutral-800 dark:bg-black/50 dark:hover:border-neutral-700"
            >
                ⚔️{" "}
                <span className="block h-4 w-px bg-neutral-300 dark:bg-neutral-600"></span>
                <AnimatedGradientText className="font-semibold">
                    New 1v1 Code Battle Mode Live Now
                </AnimatedGradientText>
                <span className="block h-4 w-px bg-neutral-300 dark:bg-neutral-600"></span>
                <ArrowRight className="size-4 text-neutral-600 transition-transform duration-300 group-hover:translate-x-1 dark:text-neutral-400" />
            </Link>
        </AnimatedGroup>
    );
};
