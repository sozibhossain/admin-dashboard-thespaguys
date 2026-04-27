import Image from "next/image";
import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,197,66,0.14),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(244,197,66,0.12),transparent_22%)]" />
      <div
        className={cn(
          "panel-gradient shadow-panel relative z-10 w-full max-w-[728px] rounded-[20px] border border-[#1e1e1e] px-8 py-10 md:px-8 md:py-12",
          className,
        )}
      >
        <div className="mx-auto mb-10 max-w-[520px] text-center">
          <h1 className="text-[52px] font-medium leading-[1.1] text-[#f4c542] md:text-[58px]">
            {title}
          </h1>
          <p className="mt-3 text-[16px] font-normal leading-[1.2] text-[#c8c8c8]">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
