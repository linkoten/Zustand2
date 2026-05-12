"use client";

import { useCompareStore } from "@/stores/compareStore";
import { GitCompareArrows, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface CompareBarProps {
  lang: string;
}

export function CompareBar({ lang }: CompareBarProps) {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const pathname = usePathname();

  // Don't show on the compare page itself
  if (items.length === 0 || pathname.includes("/fossiles/compare")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto mx-4 mb-4 w-full max-w-2xl bg-[var(--silex)] border border-[var(--parchemin)]/20 rounded-2xl shadow-2xl backdrop-blur-md px-4 py-3 flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 hidden sm:flex">
          <GitCompareArrows className="w-5 h-5 text-[var(--terracotta)]" />
        </div>

        {/* Fossile thumbnails */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex items-center gap-1.5 bg-white/5 border border-[var(--parchemin)]/15 rounded-lg px-2 py-1 text-xs text-[var(--parchemin)] group"
            >
              {item.imageUrl && (
                <div className="relative w-6 h-6 rounded flex-shrink-0 overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              )}
              <span className="truncate max-w-[80px] sm:max-w-[120px]">
                {item.title}
              </span>
              <button
                onClick={() => remove(item.id)}
                className="text-[var(--parchemin)]/40 hover:text-red-400 transition-colors ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-[var(--parchemin)]/20 text-[var(--parchemin)]/20"
            >
              <span className="text-xs">+</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clear}
            className="text-xs text-[var(--parchemin)]/40 hover:text-[var(--parchemin)]/70 transition-colors hidden sm:block"
          >
            Effacer
          </button>

          <Link
            href={`/${lang}/fossiles/compare`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              items.length >= 2
                ? "bg-terracotta text-parchemin hover:bg-terracotta/90"
                : "bg-white/5 text-[var(--parchemin)]/40 pointer-events-none"
            }`}
          >
            Comparer ({items.length}/3)
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
