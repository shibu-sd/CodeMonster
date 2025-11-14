"use client";

import { Button } from "@/components/ui/button";

interface ProblemsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function ProblemsPagination({
    currentPage,
    totalPages,
    onPageChange,
}: ProblemsPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                Previous
            </Button>

            <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                        <Button
                            key={pageNum}
                            variant={
                                currentPage === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => onPageChange(pageNum)}
                            className="min-w-[40px]"
                        >
                            {pageNum}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    );
}
