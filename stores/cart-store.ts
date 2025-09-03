import { CartState, ClientCartItem } from "@/types/type"; // ✅ Import depuis types
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,

      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.productId === product.id
        );

        const firstImageUrl =
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0].imageUrl
            : undefined;

        if (existingItem) {
          // Si le produit existe déjà, on augmente la quantité
          set((state) => ({
            items: state.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }));
        } else {
          // ✅ Utiliser ClientCartItem au lieu de CartItem de Prisma
          const newItem: ClientCartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            title: product.title,
            price: parseFloat(product.price.toString()),
            quantity: 1,
            category: product.category,
            stripeProductId: product.stripeProductId,
            stripePriceId: product.stripePriceId,
            product: {
              title: product.title,
              price: parseFloat(product.price.toString()),
              category: product.category,
            },
            imageUrl: firstImageUrl,
          };

          set((state) => ({
            items: [...state.items, newItem],
          }));
        }

        // Mettre à jour les totaux
        const newState = get();
        set({
          totalItems: newState.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalPrice: newState.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));

        // Mettre à jour les totaux
        const newState = get();
        set({
          totalItems: newState.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalPrice: newState.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));

        // Mettre à jour les totaux
        const newState = get();
        set({
          totalItems: newState.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalPrice: newState.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
);
