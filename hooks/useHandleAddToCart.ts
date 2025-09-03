import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import { SerializedProduct } from "@/types/type";

export function useHandleAddToCart() {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (product: SerializedProduct) => {
    setIsAdding(true);
    try {
      useCartStore.getState().addItem(product);
      toast.success(`${product.title} ajouté au panier !`);
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return { handleAddToCart, isAdding };
}
