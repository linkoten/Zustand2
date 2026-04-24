import { LocalityProgress } from "@/types/collectionType";

interface LocalityProgressCardProps {
  locality: LocalityProgress;
}

export default function LocalityProgressCard({
  locality,
}: LocalityProgressCardProps) {
  const { localityName, totalSpecies, ownedCount, wishlistCount } = locality;
  const pctOwned =
    totalSpecies > 0 ? Math.round((ownedCount / totalSpecies) * 100) : 0;
  const pctWishlist =
    totalSpecies > 0 ? Math.round((wishlistCount / totalSpecies) * 100) : 0;

  return (
    <div className="bg-silex/30 border border-silex/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-parchemin text-sm">{localityName}</p>
        <p className="text-parchemin/50 text-xs">
          {ownedCount}/{totalSpecies}
        </p>
      </div>

      {/* Progress bar: owned + wishlist */}
      <div className="h-2 bg-silex/50 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 h-full transition-all"
          style={{ width: `${pctOwned}%` }}
        />
        <div
          className="bg-amber-500 h-full transition-all"
          style={{ width: `${pctWishlist}%` }}
        />
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1 text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {ownedCount} possédés
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          {wishlistCount} wishlist
        </span>
      </div>
    </div>
  );
}
