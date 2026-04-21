"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="glass-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          "shadow-panel panel-gradient max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-[#3a3a3a] p-8",
          className,
        )}
      >
        {(title || description) && (
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              {title ? <h2 className="text-3xl font-medium text-white">{title}</h2> : null}
              {description ? (
                <p className="mt-2 max-w-2xl text-xl leading-[1.25] text-[#e5e5e5]">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              className="rounded-full border border-[#3a3a3a] p-2 text-[#9b9b9b] hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
