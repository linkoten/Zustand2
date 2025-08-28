import { BaseEntity, BaseEntityWithNumber } from "./type";
import { SerializedProduct, CartProduct } from "./productType";

// ===============================
// 🛒 TYPES PANIER
// ===============================

// Types de base pour les items du panier
interface BaseCartItem {
  id: string;
  productId: number;
  quantity: number;
}

// Item du panier côté client (Zustand)
export interface ClientCartItem extends BaseCartItem {
  title: string;
  price: number;
  category: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

// Item du panier côté serveur (avec produit complet)
export interface SerializedCartItem extends BaseCartItem {
  cartId: string;
  addedAt: string;
  product: SerializedProduct;
}

// Item du panier optimisé (sans images)
export interface CartItemData extends BaseCartItem {
  cartId: string;
  addedAt: string;
  product: CartProduct;
}

// Panier complet
interface BaseCart extends BaseEntity {
  userId: number;
}

export interface SerializedCart extends BaseCart {
  items: SerializedCartItem[];
}

export interface CartData extends BaseCart {
  items: CartItemData[];
}

// État du panier (Zustand)
export interface CartState {
  items: ClientCartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  // Actions
  addItem: (product: any) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// Props des composants
export interface CartItemProps {
  item: {
    id: string;
    productId: number;
    title: string;
    price: number;
    quantity: number;
    category: string;
    product: {
      title: string;
      price: number;
      category: string;
    };
  };
  onUpdate: () => Promise<void>;
}

export interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CheckoutFormProps {
  cart: SerializedCart;
}

export interface OrderSummaryProps {
  cart: SerializedCart;
}

export interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}
