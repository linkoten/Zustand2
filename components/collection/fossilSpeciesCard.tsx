"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleUserCollection } from "@/lib/actions/collectionActions";
import { FossilSpeciesItem } from "@/types/collectionType";
import { CollectionStatus } from "@/lib/generated/prisma";
import { Bookmark, CheckCircle, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";

const CATEGORY_COLORS = {
  TRILOBITE: "bg-terracotta/20 text-terracotta border-terracotta/30",
  AMMONITE: "bg-terracotta/15 text-terracotta border-terracotta/25",
  DENT: "bg-red-900/30 text-red-300 border-red-700/30",
  ECHINODERME: "bg-emerald-900/30 text-emerald-300 border-emerald-700/30",
  POISSON: "bg-sky-900/30 text-sky-300 border-sky-700/30",
  VERTEBRE: "bg-zinc-800 text-parchemin/80 border-parchemin/20",
  GASTEROPODE: "bg-terracotta/10 text-parchemin border-terracotta/20",
  AUTRE_ARTHROPODE: "bg-terracotta/20 text-terracotta border-terracotta/30",
  AUTRES: "bg-silex/60 text-parchemin/70 border-parchemin/20",
} as const;

const RARITY_STARS: Record<string, number> = {
  COMMUN: 1,
  PEU_COMMUN: 2,
  RARE: 3,
  TRES_RARE: 4,
  EXCEPTIONNEL: 5,
};

const RARITY_LABELS: Record<string, string> = {
  COMMUN: "Commun",
  PEU_COMMUN: "Peu commun",
  RARE: "Rare",
  TRES_RARE: "Très rare",
  EXCEPTIONNEL: "Exceptionnel",
};

interface FossilSpeciesCardProps {
  species: FossilSpeciesItem;
  isLoggedIn: boolean;
}

export default function FossilSpeciesCard({
  species,
  isLoggedIn,
}: FossilSpeciesCardProps) {
  const [status, setStatus] = useState<CollectionStatus | null>(
    species.userStatus ?? null,
  );
  const [pending, startTransition] = useTransition();

  const isOwned = status === "OWNED";
  const isWishlisted = status === "WISHLIST";

  function toggle(newStatus: CollectionStatus) {
    if (!isLoggedIn) {
      toast.error("Connectez-vous pour gérer votre collection");
      return;
    }
    startTransition(async () => {
      try {
        const result = await toggleUserCollection(species.id, newStatus);
        setStatus(result.status);
        if (result.status === null) toast.success("Retiré de votre collection");
        else if (result.status === "OWNED")
          toast.success("Marqué comme possédé ✓");
        else toast.success("Ajouté à votre wishlist ✓");
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  }

  // Card appearance based on ownership status
  const cardBg = isOwned
    ? "bg-green-900/20 border-green-500/30"
    : isWishlisted
      ? "bg-amber-900/20 border-amber-500/30"
      : "bg-silex/30 border-silex/20";

  return (
    <div
      className={`rounded-xl border overflow-hidden flex flex-col transition-all ${cardBg} ${pending ? "opacity-60" : ""}`}
    >
      {/* Image / placeholder */}
      <div className="relative aspect-square bg-silex/50">
        {species.photos[0] ? (
          <Image
            src={species.photos[0]}
            alt={`${species.genus} ${species.species}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-parchemin/20 text-5xl select-none">
            🦴
          </div>
        )}

        {/* Status overlay badge */}
        {isOwned && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
        {isWishlisted && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
            <Bookmark className="w-4 h-4 fill-white" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-2 left-2">
          <Badge
            variant="outline"
            className={`text-xs ${CATEGORY_COLORS[species.category]}`}
          >
            {species.category}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-parchemin font-medium italic text-sm leading-tight">
            {species.genus} {species.species}
          </p>
          {species.commonName && (
            <p className="text-parchemin/50 text-xs">{species.commonName}</p>
          )}
          <p className="text-parchemin/40 text-xs mt-0.5">
            {species.localityName}
          </p>
        </div>

        {/* Rarity stars */}
        {species.rarity && (
          <div className="flex gap-0.5" title={RARITY_LABELS[species.rarity]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < RARITY_STARS[species.rarity!]
                    ? "text-amber-400 fill-amber-400"
                    : "text-parchemin/20"
                }`}
              />
            ))}
          </div>
        )}

        {/* Stock indicator */}
        {(species.productCount ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <ShoppingCart className="w-3 h-3" />
            {species.productCount} en boutique
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-1.5 mt-auto pt-1">
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 text-xs h-7 ${
              isOwned
                ? "bg-emerald-900/40 border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/60"
                : "border-parchemin/30 text-parchemin/60 hover:text-parchemin hover:border-terracotta/40"
            }`}
            onClick={() => toggle("OWNED")}
            disabled={pending}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Possédé
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 text-xs h-7 ${
              isWishlisted
                ? "bg-terracotta/20 border-terracotta/40 text-terracotta hover:bg-terracotta/30"
                : "border-parchemin/30 text-parchemin/60 hover:text-parchemin hover:border-terracotta/40"
            }`}
            onClick={() => toggle("WISHLIST")}
            disabled={pending}
          >
            <Bookmark
              className={`w-3 h-3 mr-1 ${isWishlisted ? "fill-current" : ""}`}
            />
            Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}
