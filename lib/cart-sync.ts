import { useCartStore } from "@/stores/cart-store";
import { getCartAction } from "@/lib/actions/cart-actions";

/**
 * Synchronise le store Zustand avec la base de données
 * Utilisé après les opérations qui modifient le panier côté serveur
 */
export const syncCartWithDatabase = async (): Promise<void> => {
  try {
    const updatedCart = await getCartAction();

    if (updatedCart && updatedCart.items.length > 0) {
      // Mettre à jour le store avec les données de la BDD
      useCartStore.setState({
        items: updatedCart.items.map((cartItem) => ({
          id: cartItem.id,
          productId: cartItem.productId,
          title: cartItem.product.title,
          price: cartItem.product.price,
          quantity: cartItem.quantity,
          category: cartItem.product.category,
          stripeProductId: cartItem.product.stripeProductId ?? null,
          stripePriceId: cartItem.product.stripePriceId ?? null,
          product: {
            title: cartItem.product.title,
            price: cartItem.product.price,
            category: cartItem.product.category,
          },
          imageUrl: cartItem.product.images?.[0]?.imageUrl ?? null,
        })),
        totalItems: updatedCart.items.reduce(
          (sum, cartItem) => sum + cartItem.quantity,
          0
        ),
        totalPrice: updatedCart.items.reduce(
          (sum, cartItem) => sum + cartItem.product.price * cartItem.quantity,
          0
        ),
      });
    } else {
      // Si le panier est vide, vider le store
      useCartStore.setState({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation du panier:", error);
    throw error;
  }
};
