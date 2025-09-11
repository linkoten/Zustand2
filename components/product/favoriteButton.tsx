"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: number;
  isFavorite: boolean;
  variant?: "default" | "overlay";
  size?: "sm" | "md" | "lg";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
}
export function FavoriteButton({
  productId,
  isFavorite: initialIsFavorite,
  variant = "default",
  size = "md",
  dict,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const router = useRouter();

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error(
        dict?.products?.mustBeLoggedIn ||
          "Vous devez être connecté pour ajouter aux favoris"
      );
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/favorites", {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error(
            dict?.products?.favoriteError ||
              "Erreur lors de la mise à jour des favoris"
          );
        }

        const data = await response.json();
        setIsFavorite(!isFavorite);

        toast.success(
          isFavorite
            ? dict?.products?.removedFromFavorites || "Retiré des favoris"
            : dict?.products?.addedToFavorites || "Ajouté aux favoris",
          {
            icon: isFavorite ? "💔" : "❤️",
          }
        );
      } catch (error) {
        console.error("Erreur:", error);
        toast.error(
          dict?.products?.favoriteError ||
            "Erreur lors de la mise à jour des favoris"
        );
      }
    });
  };

  const buttonClasses = {
    default: "border-2 hover:bg-red-50 hover:border-red-300",
    overlay: "bg-white/90 hover:bg-white shadow-md backdrop-blur-sm",
  };

  const sizeClasses = {
    sm: "h-8 w-8 p-0",
    md: "h-10 w-10 p-0",
    lg: "h-12 w-12 p-0",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "transition-all duration-200",
        buttonClasses[variant],
        sizeClasses[size],
        isFavorite && "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
      )}
      onClick={handleToggleFavorite}
      disabled={isPending}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isFavorite ? "fill-current text-red-500" : "text-gray-600"
        )}
      />
    </Button>
  );
}
