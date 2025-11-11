"use client";

import { forwardRef, useRef } from "react";
import { Swords } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";
import type { BattleStartingAnimationProps } from "@/types";

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-16 items-center justify-center rounded-full border-4 border-primary bg-background p-3 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)]",
                className
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

export function BattleStartingAnimation({
    currentUser,
    opponent,
}: BattleStartingAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const user1Ref = useRef<HTMLDivElement>(null);
    const battleIconRef = useRef<HTMLDivElement>(null);
    const user2Ref = useRef<HTMLDivElement>(null);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="space-y-8 w-full max-w-4xl px-8">
                <div
                    className="relative flex h-[300px] w-full items-center justify-center overflow-hidden"
                    ref={containerRef}
                >
                    <div className="flex size-full items-center justify-between gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Circle ref={user1Ref} className="size-24">
                                <Avatar className="w-full h-full">
                                    <AvatarImage
                                        src={currentUser.profileImageUrl}
                                    />
                                    <AvatarFallback className="text-2xl bg-blue-100 dark:bg-blue-900">
                                        {currentUser.username
                                            ?.charAt(0)
                                            ?.toUpperCase() || "Y"}
                                    </AvatarFallback>
                                </Avatar>
                            </Circle>
                            <div className="text-center">
                                <p className="font-bold text-lg">
                                    {currentUser.username || "You"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Player 1
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <Circle
                                ref={battleIconRef}
                                className="size-28 border-orange-500 dark:border-orange-400"
                            >
                                <Swords className="w-16 h-16 text-orange-600 dark:text-orange-400 animate-pulse" />
                            </Circle>
                            <div className="text-center">
                                <p className="font-bold text-lg text-orange-600 dark:text-orange-400">
                                    VS
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <Circle ref={user2Ref} className="size-24">
                                <Avatar className="w-full h-full">
                                    <AvatarImage
                                        src={opponent.profileImageUrl}
                                    />
                                    <AvatarFallback className="text-2xl bg-red-100 dark:bg-red-900">
                                        {opponent.username
                                            ?.charAt(0)
                                            ?.toUpperCase() || "O"}
                                    </AvatarFallback>
                                </Avatar>
                            </Circle>
                            <div className="text-center">
                                <p className="font-bold text-lg">
                                    {opponent.username || "Opponent"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Player 2
                                </p>
                            </div>
                        </div>
                    </div>

                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={user1Ref}
                        toRef={battleIconRef}
                        duration={1.7}
                        delay={0}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#8b5cf6"
                        curvature={0}
                    />
                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={user1Ref}
                        toRef={battleIconRef}
                        duration={2}
                        delay={0.2}
                        gradientStartColor="#60a5fa"
                        gradientStopColor="#a78bfa"
                        curvature={50}
                    />
                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={user1Ref}
                        toRef={battleIconRef}
                        duration={2.3}
                        delay={0.4}
                        gradientStartColor="#2563eb"
                        gradientStopColor="#7c3aed"
                        curvature={-50}
                    />
                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={battleIconRef}
                        toRef={user2Ref}
                        duration={1.7}
                        delay={0}
                        gradientStartColor="#f97316"
                        gradientStopColor="#ef4444"
                        curvature={0}
                    />
                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={battleIconRef}
                        toRef={user2Ref}
                        duration={2}
                        delay={0.2}
                        gradientStartColor="#fb923c"
                        gradientStopColor="#f87171"
                        curvature={50}
                    />
                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={battleIconRef}
                        toRef={user2Ref}
                        duration={2.3}
                        delay={0.4}
                        gradientStartColor="#ea580c"
                        gradientStopColor="#dc2626"
                        curvature={-50}
                    />
                </div>

                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-foreground animate-pulse">
                        Battle Starting!
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Preparing the arena...
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
