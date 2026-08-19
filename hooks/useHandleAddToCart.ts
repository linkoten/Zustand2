import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/lib/actions/cart-actions";
import { syncCartWithDatabase } from "@/lib/cart-sync";
import { SerializedProduct } from "@/types/type";

export function useHandleAddToCart(lang: "fr" | "en" = "fr") {
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleAddToCart = async (product: SerializedProduct) => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter au panier");
      router.push(`/${lang}/sign-in`);
      return;
    }

    setIsAdding(true);
    try {
      // 1. Appelle l'action backend pour ajouter en BDD
      const result = await addToCartAction(product.id);

      if (result.success) {
        // 2. Synchronise le store avec la BDD pour avoir les vraies données
        await syncCartWithDatabase();

        toast.success(`${product.title} ajouté au panier !`);
      } else {
        toast.error(result.error || "Erreur lors de l'ajout au panier");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return { handleAddToCart, isAdding };
}
