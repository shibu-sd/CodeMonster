import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
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
    const [currentWord, setCurrentWord] = useState(0);
    const words = ["Harder", "Faster", "Deeper"];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const getPrimaryActionUrl = () => {
        if (!isLoaded) return "/auth/sign-up";
        return isSignedIn ? "/problems" : "/auth/sign-up";
    };

    const getSecondaryActionUrl = () => {
        if (!isLoaded) return "/auth/sign-in";
        return isSignedIn ? "/problems" : "/auth/sign-in";
    };

    const getPrimaryActionText = () => {
        if (!isLoaded) return "Go Monster Mode";
        return isSignedIn ? "Go Monster Mode" : "Go Monster Mode";
    };

    return (
        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
            <motion.h1
                initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.3,
                }}
                className="mt-8 text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] leading-tight"
            >
                The Monster inside
                <br />
                you codes{" "}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={words[currentWord]}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="text-primary"
                    >
                        {words[currentWord]}
                    </motion.span>
                </AnimatePresence>
            </motion.h1>
            <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-8 max-w-2xl text-balance text-lg"
            >
                Solve algorithmic challenges, compete on leaderboards, and
                master DSA through real-time battles. Train your logic, track
                your progress, and evolve into an unstoppable coding monster.
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
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row pointer-events-auto"
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
            </AnimatedGroup>
        </div>
    );
};
