import React from "react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import {
    Terminal,
    TypingAnimation,
    AnimatedSpan,
} from "@/components/ui/terminal";

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
            <div className="relative -mr-56 mt-8 px-2 sm:mr-0 sm:mt-12 md:mt-18">
                <Terminal
                    className="w-full max-w-6xl mx-auto h-[70vh]"
                    startOnView={true}
                    isLoop={true}
                    loopDelay={2000}
                >
                    <TypingAnimation className="text-green-400">
                        $ codemonster init
                    </TypingAnimation>
                    <TypingAnimation className="text-blue-400">
                        🚀 Initializing CodeMonster environment...
                    </TypingAnimation>
                    <AnimatedSpan className="text-gray-400">
                        ✓ Loading problem database
                    </AnimatedSpan>
                    <AnimatedSpan className="text-gray-400">
                        ✓ Setting up test runner
                    </AnimatedSpan>
                    <AnimatedSpan className="text-gray-400">
                        ✓ Configuring code editor
                    </AnimatedSpan>
                    <TypingAnimation className="text-green-400">
                        $ codemonster run --problem "two-sum"
                    </TypingAnimation>
                    <TypingAnimation className="text-blue-400">
                        🔄 Running test cases for two-sum...
                    </TypingAnimation>
                    <AnimatedSpan className="text-gray-400">
                        Test 1: [2,7,11,15], target=9
                    </AnimatedSpan>
                    <AnimatedSpan className="text-green-400">
                        ✓ Passed (returned [0,1])
                    </AnimatedSpan>
                    <AnimatedSpan className="text-gray-400">
                        Test 2: [3,2,4], target=6
                    </AnimatedSpan>
                    <AnimatedSpan className="text-green-400">
                        ✓ Passed (returned [1,2])
                    </AnimatedSpan>
                    <AnimatedSpan className="text-gray-400">
                        Test 3: [3,3], target=6
                    </AnimatedSpan>
                    <AnimatedSpan className="text-green-400">
                        ✓ Passed (returned [0,1])
                    </AnimatedSpan>
                    <TypingAnimation className="text-cyan-400">
                        ⚡ Compiling your solution...
                    </TypingAnimation>
                    <TypingAnimation className="text-yellow-400">
                        🎉 All tests passed! Problem solved in 0.234s
                    </TypingAnimation>
                </Terminal>
            </div>
        </AnimatedGroup>
    );
};
