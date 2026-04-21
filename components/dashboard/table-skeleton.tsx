import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#343434] bg-[#181818]">
      <div className="grid grid-cols-6 gap-4 border-b border-[#343434] bg-[#2a2a2a] px-6 py-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-28" />
        ))}
      </div>
      <div className="space-y-0">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 border-b border-[#343434] px-6 py-6 last:border-b-0">
            {Array.from({ length: 6 }).map((__, cell) => (
              <Skeleton key={cell} className="h-6 w-full max-w-[160px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
