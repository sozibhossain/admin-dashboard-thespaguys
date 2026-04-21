import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  breadcrumb,
  actions,
  className,
}: {
  title: string;
  breadcrumb: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel-gradient mb-6 rounded-[24px] border border-[#343434] px-6 py-7 md:px-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-medium leading-[1.1] text-white">{title}</h1>
          <p className="mt-4 text-[16px] text-[#9c9c9c]">{breadcrumb}</p>
        </div>
        {actions}
      </div>
    </div>
  );
}
