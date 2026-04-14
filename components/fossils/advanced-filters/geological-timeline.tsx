"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// L'ordre chronologique des périodes (du plus ancien au plus récent)
const PERIODS = [
  "CAMBRIEN",
  "ORDOVICIEN",
  "SILURIEN",
  "DEVONIEN",
  "CARBONIFERE",
  "PERMIEN",
  "TRIAS",
  "JURASSIQUE",
  "CRETACE",
  "PALEOGENE",
  "NEOGENE",
  "QUATERNAIRE",
];

// Couleurs par défaut associées à chaque période géologique (standard géologique approx)
const PERIOD_COLORS: Record<string, string> = {
  CAMBRIEN: "bg-[#40E0D0]/20 text-[#40E0D0] border-[#40E0D0]",
  ORDOVICIEN: "bg-[#0066CC]/20 text-[#0066CC] border-[#0066CC]",
  SILURIEN: "bg-[#8A2BE2]/20 text-[#8A2BE2] border-[#8A2BE2]",
  DEVONIEN: "bg-[#B22222]/20 text-[#B22222] border-[#B22222]",
  CARBONIFERE: "bg-[#228B22]/20 text-[#228B22] border-[#228B22]",
  PERMIEN: "bg-[#C71585]/20 text-[#C71585] border-[#C71585]",
  TRIAS: "bg-[#CD853F]/20 text-[#CD853F] border-[#CD853F]",
  JURASSIQUE: "bg-[#808000]/20 text-[#808000] border-[#808000]",
  CRETACE: "bg-[#9AFF9A]/20 text-[#9AFF9A] border-[#9AFF9A]",
  PALEOGENE: "bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]",
  NEOGENE: "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]",
  QUATERNAIRE: "bg-[#D3D3D3]/20 text-[#D3D3D3] border-[#D3D3D3]",
};

interface GeologicalTimelineProps {
  selectedPeriods: string[];
  onPeriodToggle: (period: string) => void;
  availablePeriods: string[]; // Ceux qui ont des fossiles associés
}

export function GeologicalTimeline({
  selectedPeriods,
  onPeriodToggle,
  availablePeriods,
}: GeologicalTimelineProps) {
  return (
    <div className="my-8">
      <h3 className="text-lg font-serif font-bold text-parchemin mb-4">
        Frise Chronologique
      </h3>
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-terracotta/20 bg-silex/50 p-4">
          <div className="flex w-max space-x-2 items-center py-2 px-1">
            {/* Ligne de la frise (derrière les badges) */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-terracotta/20 -z-10 transform -translate-y-1/2" />

            {PERIODS.map((period) => {
              const isAvailable = availablePeriods.includes(period);
              const isSelected = selectedPeriods.includes(period);
              const colorClasses =
                PERIOD_COLORS[period] ||
                "bg-gray-500/20 text-gray-500 border-gray-500";
              const isActiveStyle = isSelected
                ? `${colorClasses} shadow-[0_0_10px_currentColor] scale-110`
                : "bg-black/50 text-parchemin/50 border-terracotta/20 hover:border-terracotta/50";

              return (
                <button
                  key={period}
                  disabled={!isAvailable}
                  onClick={() => onPeriodToggle(period)}
                  className={cn(
                    "relative flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-300 font-medium text-sm backdrop-blur-sm z-10",
                    isActiveStyle,
                    !isAvailable &&
                      "opacity-30 cursor-not-allowed hidden md:block", // Optionnel: masquer ou griser les indisponibles
                  )}
                  style={{
                    display: isAvailable || isSelected ? "block" : "none",
                  }}
                >
                  {/* Petit marqueur de chronologie */}
                  <div className="absolute -bottom-[22px] left-1/2 w-2 h-2 rounded-full bg-current transform -translate-x-1/2" />
                  <div className="absolute -bottom-[20px] left-1/2 w-0.5 h-[20px] bg-current transform -translate-x-1/2 opacity-50" />

                  {period}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="bg-silex" />
        </ScrollArea>
      </div>
    </div>
  );
}
