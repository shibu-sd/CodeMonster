import React from "react";
import { AnimatedGroup } from "@/components/ui/animated-group";

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

export const HeroDemo: React.FC = () => {
    return (
        <AnimatedGroup
            variants={{
                container: {
                    visible: {
                        transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.75,
                        },
                    },
                },
                ...transitionVariants,
            }}
        >
            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                    aria-hidden
                    className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-zinc-800/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                    <div className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block flex items-center justify-center">
                        <div className="text-muted-foreground text-center">
                            <div className="text-4xl mb-2">
                                ⚡
                            </div>
                            <div className="text-sm">
                                Online Judge
                            </div>
                        </div>
                    </div>
                    <div className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden flex items-center justify-center">
                        <div className="text-muted-foreground text-center">
                            <div className="text-4xl mb-2">
                                ⚡
                            </div>
                            <div className="text-sm">
                                Online Judge
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedGroup>
    );
};