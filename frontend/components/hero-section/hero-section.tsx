"use client";

import React, { useEffect, useRef, useState, memo, useCallback } from "react";
import { HeroHeader } from "@/components/header/header";
import { HeroAnnouncement } from "./hero-announcement";
import { HeroContent } from "./hero-content";
import { HeroDemo } from "./hero-demo";
import HeroFeatures from "./hero-features";
import styles from "./hero-grid.module.css";

const CELL_SIZE = 120; // px
const COLORS = [
    "oklch(0.72 0.2 352.53)", // blue
    "#A764FF",
    "#4B94FD",
    "#FD4B4E",
    "#FF8743",
];

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const SubGrid = memo(function SubGrid() {
    const [cellColors, setCellColors] = useState<(string | null)[]>([
        null,
        null,
        null,
        null,
    ]);
    // Add refs for leave timeouts
    const leaveTimeouts = useRef<(NodeJS.Timeout | null)[]>([
        null,
        null,
        null,
        null,
    ]);

    const handleHover = useCallback((cellIdx: number) => {
        // Clear any pending timeout for this cell
        const timeout = leaveTimeouts.current[cellIdx];
        if (timeout) {
            clearTimeout(timeout);
            leaveTimeouts.current[cellIdx] = null;
        }
        setCellColors((prev) =>
            prev.map((c, i) => (i === cellIdx ? getRandomColor() : c))
        );
    }, []);

    const handleLeave = useCallback((cellIdx: number) => {
        // Add a small delay before removing the color
        leaveTimeouts.current[cellIdx] = setTimeout(() => {
            setCellColors((prev) =>
                prev.map((c, i) => (i === cellIdx ? null : c))
            );
            leaveTimeouts.current[cellIdx] = null;
        }, 120);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leaveTimeouts.current.forEach((t) => t && clearTimeout(t));
        };
    }, []);

    return (
        <div className={styles.subgrid} style={{ pointerEvents: "none" }}>
            {[0, 1, 2, 3].map((cellIdx) => (
                <button
                    key={cellIdx}
                    type="button"
                    className={styles.cell}
                    style={{
                        background: cellColors[cellIdx] || "transparent",
                        pointerEvents: "auto",
                    }}
                    onMouseEnter={() => handleHover(cellIdx)}
                    onMouseLeave={() => handleLeave(cellIdx)}
                />
            ))}
        </div>
    );
});

function InteractiveGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [grid, setGrid] = useState({ columns: 0, rows: 0 });
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateGrid = useCallback(() => {
        if (containerRef.current) {
            const { width, height } =
                containerRef.current.getBoundingClientRect();
            setGrid({
                columns: Math.ceil(width / CELL_SIZE),
                rows: Math.ceil(height / CELL_SIZE),
            });
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(updateGrid, 150);
        };

        updateGrid(); // Initial grid calculation
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [updateGrid]);

    const total = grid.columns * grid.rows;

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ width: "100%", height: "100%" }}
        >
            <div
                className={styles.mainGrid}
                style={
                    {
                        gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
                        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                        "--grid-cell-size": `${CELL_SIZE}px`,
                        width: "100%",
                        height: "100%",
                    } as React.CSSProperties
                }
            >
                {Array.from({ length: total }, (_, idx) => (
                    <SubGrid
                        key={`subgrid-${grid.columns}-${grid.rows}-${idx}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="relative overflow-hidden py-36">
                    {/* Interactive animated grid background */}
                    <InteractiveGrid />
                    <div className="relative z-10 pointer-events-none">
                        <div className="mx-auto max-w-7xl px-6">
                            <HeroAnnouncement />
                            <HeroContent />
                            <HeroDemo />
                        </div>
                    </div>
                </section>
                <HeroFeatures />
            </main>
        </>
    );
}
