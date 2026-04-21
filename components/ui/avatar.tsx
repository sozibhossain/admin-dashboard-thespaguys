import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  name,
  className,
}: {
  src?: string | null;
  alt?: string;
  name?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full bg-[#2b2b2b]", className)}>
        <Image src={src} alt={alt || name || "Avatar"} fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#4d4d4d_0%,#2a2a2a_100%)] text-sm font-semibold text-white",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
