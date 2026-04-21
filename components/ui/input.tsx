import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-14 w-full rounded-xl border border-[#7f6510] bg-[#28241b] px-4 text-[16px] leading-[1.2] text-white outline-none transition placeholder:text-[#8f8f8f] focus:border-[#f4c542] focus:bg-[#2f2a1f]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
