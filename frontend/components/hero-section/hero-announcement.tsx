import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

export const HeroAnnouncement: React.FC = () => {
    return (
        <AnimatedGroup
            variants={transitionVariants}
            className="pointer-events-auto"
        >
            <Link
                href="#link"
                className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-transparent dark:shadow-zinc-950"
            >
                <span className="text-foreground text-sm">
                    New Contest Platform & Judge System
                </span>
                <span className="dark:border-background block h-4 w-0.5 border-l bg-zinc-300 dark:bg-zinc-700"></span>

                <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                            <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                            <ArrowRight className="m-auto size-3" />
                        </span>
                    </div>
                </div>
            </Link>
        </AnimatedGroup>
    );
};
