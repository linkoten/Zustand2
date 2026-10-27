"use client";

import Link from "next/link";
import Image from "next/image";
import { SerializedProduct } from "@/types/type";
import { formatPrice } from "@/lib/utils";

interface FossilListItemProps {
  fossil: SerializedProduct;
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
}

export function FossilListItem({ fossil, lang, dict }: FossilListItemProps) {
  return (
    <Link
      href={`/${lang}/fossiles/${fossil.id}`}
      className="flex items-center gap-3 sm:gap-4 bg-zinc-950 border border-zinc-800 hover:border-[var(--terracotta)]/50 rounded-xl p-3 sm:p-4 transition-colors duration-200"
    >
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-900">
        {fossil.images?.[0] ? (
          <Image
            src={fossil.images[0].imageUrl}
            alt={fossil.images[0].altText || fossil.title}
            fill
            sizes="64px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-600 text-[9px] text-center px-1">
              {dict?.fossils?.noImage || "Pas d'image"}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-serif font-semibold text-sm sm:text-base text-[var(--parchemin)] truncate">
          {fossil.title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--parchemin)]/50 truncate">
          {fossil.locality?.name &&
            `${dict?.fossils?.localityLabel || "Localité"}: ${fossil.locality.name}`}
          {fossil.locality?.name && fossil.geologicalStage && " · "}
          {fossil.geologicalStage &&
            `${dict?.fossils?.stageLabel || "Étage"}: ${fossil.geologicalStage}`}
        </p>
      </div>

      <div className="shrink-0 text-sm sm:text-lg font-bold text-[var(--terracotta)]">
        {formatPrice(fossil.price)}
      </div>
    </Link>
  );
}
