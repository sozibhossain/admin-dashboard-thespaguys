import { cn } from "@/lib/utils";

const statusClassMap: Record<string, string> = {
  active: "border-[#2be560] text-[#2be560] bg-[rgba(43,229,96,0.1)]",
  inactive: "border-[#d07d19] text-[#d07d19] bg-[rgba(208,125,25,0.1)]",
  accepted: "border-[#00d2ff] text-[#00d2ff] bg-[rgba(0,210,255,0.12)]",
  pending: "border-[#c79b1b] text-[#f4d06f] bg-[rgba(199,155,27,0.12)]",
  completed: "border-[#2be560] text-[#2be560] bg-[rgba(43,229,96,0.12)]",
  cancelled: "border-[#ff5555] text-[#ff5555] bg-[rgba(255,85,85,0.12)]",
  paid: "border-[#2be560] text-[#2be560] bg-[rgba(43,229,96,0.12)]",
  "non paid": "border-[#d4a100] text-[#d4a100] bg-[rgba(212,161,0,0.12)]",
  failed: "border-[#ff5555] text-[#ff5555] bg-[rgba(255,85,85,0.12)]",
  refunded: "border-[#00d2ff] text-[#00d2ff] bg-[rgba(0,210,255,0.12)]",
  ongoing: "border-[#c79b1b] text-[#f4c542] bg-[rgba(199,155,27,0.12)]",
  "not started": "border-[#585858] text-[#a7a7a7] bg-[rgba(88,88,88,0.18)]",
  new: "border-[#b100ff] text-[#e091ff] bg-[rgba(177,0,255,0.12)]",
  "in progress": "border-[#00d2ff] text-[#00d2ff] bg-[rgba(0,210,255,0.12)]",
  quoted: "border-[#d4a100] text-[#f4c542] bg-[rgba(212,161,0,0.12)]",
  confirmed: "border-[#2be560] text-[#2be560] bg-[rgba(43,229,96,0.12)]",
};

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.replaceAll("_", " ").toLowerCase();

  return (
    <span
      className={cn(
        "status-pill inline-flex min-w-[96px] items-center justify-center border",
        statusClassMap[normalized] ??
          "border-[#4a4a4a] text-[#d0d0d0] bg-[rgba(74,74,74,0.16)]",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
