import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { useAuth } from "@clerk/nextjs";

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

export const HeroContent: React.FC = () => {
    const { isSignedIn, isLoaded } = useAuth();

    const getPrimaryActionUrl = () => {
        if (!isLoaded) return "/auth/sign-up";
        return isSignedIn ? "/problems" : "/auth/sign-up";
    };

    const getSecondaryActionUrl = () => {
        if (!isLoaded) return "/auth/sign-in";
        return isSignedIn ? "/problems" : "/auth/sign-in";
    };

    const getPrimaryActionText = () => {
        if (!isLoaded) return "Get Started";
        return isSignedIn ? "Start Solving" : "Get Started";
    };

    const getSecondaryActionText = () => {
        if (!isLoaded) return "Sign In";
        return isSignedIn ? "Browse Problems" : "Sign In";
    };

    return (
        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
            <TextEffect
                preset="fade-in-blur"
                speedSegment={0.3}
                as="h1"
                className="mt-8 text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]"
            >
                Master Coding Through Practice
            </TextEffect>
            <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-8 max-w-2xl text-balance text-lg"
            >
                Solve algorithmic problems, compete with
                others, and improve your programming skills.
                Practice data structures, algorithms, and
                competitive programming with instant
                feedback from our online judge.
            </TextEffect>

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
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
            >
                <div
                    key={1}
                    className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                >
                    <Button
                        asChild
                        size="lg"
                        className="rounded-xl px-5 text-base"
                    >
                        <Link href={getPrimaryActionUrl()}>
                            <span className="text-nowrap">
                                {getPrimaryActionText()}
                            </span>
                        </Link>
                    </Button>
                </div>
                <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10.5 rounded-xl px-5"
                >
                    <Link href={getSecondaryActionUrl()}>
                        <span className="text-nowrap">
                            {getSecondaryActionText()}
                        </span>
                    </Link>
                </Button>
            </AnimatedGroup>
        </div>
    );
};