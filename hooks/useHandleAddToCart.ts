import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import { addToCartAction } from "@/lib/actions/cart-actions"; // 👈
import { SerializedProduct } from "@/types/type";

export function useHandleAddToCart() {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (product: SerializedProduct) => {
    setIsAdding(true);
    try {
      // 1. Appelle l'action backend
      const result = await addToCartAction(product.id);

      if (result.success) {
        // 2. Mets à jour le store Zustand pour l'UI (optionnel si tu relies le store au backend)
        useCartStore.getState().addItem(product);
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
