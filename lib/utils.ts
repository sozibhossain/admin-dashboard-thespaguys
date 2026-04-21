import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatDate(value?: string | Date | null, pattern = "dd MMM yyyy") {
  if (!value) return "N/A";
  return format(new Date(value), pattern);
}

export function getInitials(name?: string | null) {
  if (!name) return "TS";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function parseNameParts(name?: string | null) {
  const trimmed = name?.trim() || "";
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = trimmed.split(" ");
  return {
    firstName,
    lastName: rest.join(" "),
  };
}
