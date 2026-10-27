"use client";

import { ChevronDown } from "lucide-react";

interface FilterSectionToggleProps {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}

export default function FilterSectionToggle({
  title,
  count,
  open,
  onToggle,
}: FilterSectionToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-2 cursor-pointer group"
    >
      <span className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2">
        <span className="w-2 h-2 bg-[var(--terracotta)] rounded-full"></span>
        {title}
        {count > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--terracotta)]/20 text-[var(--terracotta)]">
            {count}
          </span>
        )}
      </span>
      <ChevronDown
        className={`w-4 h-4 text-[var(--parchemin)]/50 group-hover:text-[var(--terracotta)] transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}
