import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[150px] w-full rounded-xl border border-[#4a4a4a] bg-[#535353] px-4 py-4 text-[16px] leading-[1.2] text-white outline-none placeholder:text-[#d3d3d3] focus:border-[#f4c542]",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
