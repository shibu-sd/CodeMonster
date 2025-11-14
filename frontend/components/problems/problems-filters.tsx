"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProblemsFiltersProps {
    searchTerm: string;
    selectedDifficulty: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onDifficultyChange: (difficulty: string) => void;
}

export function ProblemsFilters({
    searchTerm,
    selectedDifficulty,
    onSearchChange,
    onSearchSubmit,
    onDifficultyChange,
}: ProblemsFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={onSearchSubmit} className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </form>

            <div className="flex gap-2">
                {selectedDifficulty === "EASY" ? (
                    <button
                        onClick={() => onDifficultyChange("EASY")}
                        className="p-[3px] relative h-10 rounded-lg transform hover:scale-105 transition-all duration-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-lg" />
                        <div className="px-6 h-full flex items-center justify-center rounded-[6px] relative transition duration-200 text-base font-medium bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                            Easy
                        </div>
                    </button>
                ) : (
                    <Button
                        variant="outline"
                        size="default"
                        onClick={() => onDifficultyChange("EASY")}
                        className="text-green-600 hover:text-green-400 transform hover:scale-105 transition-all duration-200 h-10 px-6 text-base"
                    >
                        Easy
                    </Button>
                )}
                {selectedDifficulty === "MEDIUM" ? (
                    <button
                        onClick={() => onDifficultyChange("MEDIUM")}
                        className="p-[3px] relative h-10 rounded-lg transform hover:scale-105 transition-all duration-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg" />
                        <div className="px-6 h-full flex items-center justify-center rounded-[6px] relative transition duration-200 text-base font-medium bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">
                            Medium
                        </div>
                    </button>
                ) : (
                    <Button
                        variant="outline"
                        size="default"
                        onClick={() => onDifficultyChange("MEDIUM")}
                        className="text-yellow-600 hover:text-yellow-400 transform hover:scale-105 transition-all duration-200 h-10 px-6 text-base"
                    >
                        Medium
                    </Button>
                )}
                {selectedDifficulty === "HARD" ? (
                    <button
                        onClick={() => onDifficultyChange("HARD")}
                        className="p-[3px] relative h-10 rounded-lg transform hover:scale-105 transition-all duration-200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-lg" />
                        <div className="px-6 h-full flex items-center justify-center rounded-[6px] relative transition duration-200 text-base font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                            Hard
                        </div>
                    </button>
                ) : (
                    <Button
                        variant="outline"
                        size="default"
                        onClick={() => onDifficultyChange("HARD")}
                        className="text-red-600 hover:text-red-400 transform hover:scale-105 transition-all duration-200 h-10 px-6 text-base"
                    >
                        Hard
                    </Button>
                )}
            </div>
        </div>
    );
}
