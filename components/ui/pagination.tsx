"use client";

import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (value) =>
      value === 1 ||
      value === totalPages ||
      Math.abs(value - page) <= 1,
  );

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((value, index) => {
        const showEllipsis = index > 0 && value - pages[index - 1] > 1;
        return (
          <div key={value} className="flex items-center gap-3">
            {showEllipsis ? (
              <div className="flex size-10 items-center justify-center rounded-xl border border-[#3a3a3a] bg-[#1d1d1d] text-white">
                <Ellipsis className="size-4" />
              </div>
            ) : null}
            <button
              className={cn(
                "flex size-10 items-center justify-center rounded-xl border text-sm",
                value === page
                  ? "border-[#d4a100] bg-[#d4a100] text-white"
                  : "border-[#3a3a3a] bg-[#1d1d1d] text-white",
              )}
              onClick={() => onPageChange(value)}
              type="button"
            >
              {value}
            </button>
          </div>
        );
      })}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
