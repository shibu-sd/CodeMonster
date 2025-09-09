"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MascotProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export const InteractiveMascot: React.FC<MascotProps> = ({
    className,
    size = "md",
}) => {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const mascotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (!mascotRef.current) return;

            const mascotRect = mascotRef.current.getBoundingClientRect();
            const mascotCenterX = mascotRect.left + mascotRect.width / 2;
            const mascotCenterY = mascotRect.top + mascotRect.height / 2;

            const deltaX = event.clientX - mascotCenterX;
            const deltaY = event.clientY - mascotCenterY;

            // Calculate distance from monster center
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Normalize the direction vector and limit eye movement
            const maxEyeMovement = 2.5; // Maximum distance pupils can move from center
            let eyeX = 0;
            let eyeY = 0;

            if (distance > 0) {
                // Calculate normalized direction
                const directionX = deltaX / distance;
                const directionY = deltaY / distance;

                // Apply movement with proper scaling
                const movementScale = Math.min(distance / 100, 1); // Scale based on cursor distance
                eyeX = directionX * maxEyeMovement * movementScale;
                eyeY = directionY * maxEyeMovement * movementScale;
            }

            setEyePosition({ x: eyeX, y: eyeY });
        };

        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const sizeConfig = {
        sm: {
            size: 48,
            eyeSize: "w-3 h-3",
            pupilSize: "w-1.5 h-1.5",
            eyeTop: "top-4",
            eyeSpacing: "space-x-1",
        },
        md: {
            size: 64,
            eyeSize: "w-4 h-4",
            pupilSize: "w-2 h-2",
            eyeTop: "top-5",
            eyeSpacing: "space-x-1.5",
        },
        lg: {
            size: 80,
            eyeSize: "w-5 h-5",
            pupilSize: "w-2.5 h-2.5",
            eyeTop: "top-6",
            eyeSpacing: "space-x-2",
        },
    };

    const config = sizeConfig[size];

    return (
        <div
            ref={mascotRef}
            className={cn(
                "relative transition-transform hover:scale-110 cursor-pointer",
                className
            )}
            style={{
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
                width: config.size,
                height: config.size,
            }}
        >
            {/* Your actual logo */}
            <Image
                src="/logo.png"
                alt="CodeMonster"
                width={config.size}
                height={config.size}
                className="w-full h-full object-contain"
            />

            {/* Interactive eyes overlay - positioned over the logo's eyes */}
            <div
                className={cn(
                    "absolute left-1/2 transform -translate-x-1/2 flex",
                    config.eyeTop,
                    config.eyeSpacing
                )}
            >
                {/* Left Eye - Round shape */}
                <div
                    className={cn(
                        "relative bg-white rounded-full border-2 border-gray-800",
                        config.eyeSize
                    )}
                >
                    <div
                        className={cn(
                            "absolute bg-gray-900 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                            config.pupilSize
                        )}
                        style={{
                            transform: `translate(${eyePosition.x}px, ${eyePosition.y}px) translate(-50%, -50%)`,
                        }}
                    >
                        {/* Pupil highlight */}
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>

                {/* Right Eye - Round shape */}
                <div
                    className={cn(
                        "relative bg-white rounded-full border-2 border-gray-800",
                        config.eyeSize
                    )}
                >
                    <div
                        className={cn(
                            "absolute bg-gray-900 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                            config.pupilSize
                        )}
                        style={{
                            transform: `translate(${eyePosition.x}px, ${eyePosition.y}px) translate(-50%, -50%)`,
                        }}
                    >
                        {/* Pupil highlight */}
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Dashboard positioned version
export const DashboardMascot: React.FC = () => {
    return (
        <div className="fixed top-4 right-4 z-50 hidden lg:block">
            <div className="relative">
                {/* Speech bubble (optional) */}
                <div className="absolute -left-32 top-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Ready to solve some problems? 🚀
                    </div>
                    <div className="absolute right-0 top-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-l-white dark:border-l-gray-800"></div>
                </div>

                <InteractiveMascot size="lg" className="animate-bounce-slow" />
            </div>
        </div>
    );
};
