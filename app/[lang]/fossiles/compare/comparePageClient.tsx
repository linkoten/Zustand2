"use client";

import { useCompareStore } from "@/stores/compareStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, ShoppingCart, Scale } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useHandleAddToCart } from "@/hooks/useHandleAddToCart";

// Rows to compare
const COMPARE_ROWS = [
  { key: "price", label: "Prix", format: (v: unknown) => `${Number(v).toLocaleString("fr-FR")} €` },
  { key: "category", label: "Catégorie" },
  { key: "species", label: "Espèce" },
  { key: "genre", label: "Genre" },
  { key: "geologicalPeriod", label: "Période" },
  { key: "geologicalStage", label: "Étage" },
  { key: "countryOfOrigin", label: "Pays d'origine" },
  { key: "weight", label: "Poids", format: (v: unknown) => v ? `${v} g` : "—" },
] as const;

interface ComparePageClientProps {
  lang: string;
}

export default function ComparePageClient({ lang }: ComparePageClientProps) {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const router = useRouter();

  // Fake SerializedProduct shape for useHandleAddToCart
  // We can't use the hook directly here since we don't have full product; link to product page instead

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
        <Scale className="w-16 h-16 text-[var(--parchemin)]/20" />
        <h1 className="text-3xl font-serif font-bold text-[var(--parchemin)]">
          Aucun fossile à comparer
        </h1>
        <p className="text-[var(--parchemin)]/50 max-w-md">
          Ajoutez jusqu&apos;à 3 fossiles depuis le catalogue en cliquant sur &laquo; Comparer &raquo;.
        </p>
        <Button asChild className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground">
          <Link href={`/${lang}/fossiles`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au catalogue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-[var(--parchemin)]/60 hover:text-[var(--parchemin)]"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--parchemin)]">
              Comparateur de fossiles
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
            className="text-[var(--parchemin)]/60 border-[var(--parchemin)]/20 hover:border-red-400/50 hover:text-red-400"
          >
            <X className="w-4 h-4 mr-1" />
            Tout effacer
          </Button>
        </div>

        {/* Compare table */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--parchemin)]/10 bg-[var(--silex)] shadow-2xl">
          <table className="w-full">
            {/* Images + titles header */}
            <thead>
              <tr className="border-b border-[var(--parchemin)]/10">
                {/* Label column */}
                <th className="w-36 md:w-44 p-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--parchemin)]/40">
                  Caractéristique
                </th>

                {items.map((item) => (
                  <th key={item.id} className="p-4 text-center align-top">
                    <div className="flex flex-col items-center gap-3 min-w-[140px]">
                      {/* Remove button */}
                      <button
                        onClick={() => remove(item.id)}
                        className="self-end text-[var(--parchemin)]/30 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Image */}
                      {item.imageUrl ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--parchemin)]/10">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-white/5 border border-[var(--parchemin)]/10 flex items-center justify-center">
                          <Scale className="w-8 h-8 text-[var(--parchemin)]/20" />
                        </div>
                      )}

                      {/* Title + link */}
                      <Link
                        href={`/${lang}/fossiles/${item.id}`}
                        className="text-sm font-semibold text-[var(--parchemin)] hover:text-[var(--terracotta)] transition-colors text-center leading-tight line-clamp-2"
                      >
                        {item.title}
                      </Link>

                      {/* Price */}
                      <span className="text-lg font-bold text-[var(--terracotta)]">
                        {item.price.toLocaleString("fr-FR")} €
                      </span>

                      {/* CTA */}
                      <Button
                        asChild
                        size="sm"
                        className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground w-full text-xs"
                      >
                        <Link href={`/${lang}/fossiles/${item.id}`}>
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                          Voir le fossile
                        </Link>
                      </Button>
                    </div>
                  </th>
                ))}

                {/* Empty placeholders if < 3 */}
                {Array.from({ length: 3 - items.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-3 min-w-[140px]">
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--parchemin)]/15 flex items-center justify-center">
                        <span className="text-2xl text-[var(--parchemin)]/20">+</span>
                      </div>
                      <Link
                        href={`/${lang}/fossiles`}
                        className="text-xs text-[var(--parchemin)]/30 hover:text-[var(--terracotta)] transition-colors"
                      >
                        Ajouter un fossile
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Comparison rows */}
            <tbody>
              {COMPARE_ROWS.map((row, rowIndex) => (
                <tr
                  key={row.key}
                  className={`border-b border-[var(--parchemin)]/5 ${rowIndex % 2 === 0 ? "" : "bg-white/2"}`}
                >
                  {/* Label */}
                  <td className="p-4 text-xs font-semibold text-[var(--parchemin)]/50 uppercase tracking-wider">
                    {row.label}
                  </td>

                  {items.map((item) => {
                    const raw = item[row.key as keyof typeof item];
                    const display = "format" in row && row.format
                      ? row.format(raw)
                      : String(raw ?? "—");

                    return (
                      <td key={item.id} className="p-4 text-center">
                        <span className="text-sm text-[var(--parchemin)] font-medium">
                          {display || "—"}
                        </span>
                      </td>
                    );
                  })}

                  {/* Empty column placeholders */}
                  {Array.from({ length: 3 - items.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="p-4 text-center">
                      <span className="text-[var(--parchemin)]/20">—</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
