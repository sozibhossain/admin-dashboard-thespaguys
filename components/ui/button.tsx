"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl border text-[16px] leading-[1.2] font-medium transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "gold-gradient border-[#f4c542] text-white shadow-[0_10px_30px_rgba(244,197,66,0.18)]",
        outline: "border-[#d4a100] bg-transparent text-[#f4c542] hover:bg-[#2a2412]",
        ghost: "border-transparent bg-transparent text-white hover:bg-[#222222]",
        danger: "border-[#ff3030] bg-transparent text-[#ff3030] hover:bg-[#2a1414]",
        surface: "border-[#3a3a3a] bg-[#2a2a2a] text-white hover:bg-[#343434]",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-10 px-4",
        lg: "h-14 px-6",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  ),
);

Button.displayName = "Button";
