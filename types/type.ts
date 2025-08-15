import {
  Category,
  GeologicalPeriod,
  Product,
  ProductStatus,
  CartItem as PrismaCartItem, // ✅ Renommer pour éviter le conflit
} from "@/lib/generated/prisma";

// Types pour les retours d'actions
export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Types pour les données Clerk
export interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification?: {
    status: string;
    strategy: string;
  };
}

export interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name?: string;
  last_name?: string;
  primary_email_address_id?: string;
}

export interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

// Types corrigés pour les objets Stripe avec propriétés nullables
export interface StripeProduct {
  id: string;
  name: string;
  description?: string | null;
  metadata: Record<string, string>;
  active: boolean;
  created: number;
  updated: number;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number | null;
  currency: string;
  active: boolean;
  metadata: Record<string, string>;
}

export interface StripeCustomer {
  id: string;
  email: string | null;
  name?: string | null;
  metadata?: Record<string, string>;
}

export interface StripeSession {
  id: string;
  amount_total: number | null;
  currency?: string | null;
  customer?: string | null;
  metadata?: Record<string, string>;
}

// ✅ Type avec price converti en number
export interface SerializedProduct
  extends Omit<Product, "price" | "createdAt" | "updatedAt"> {
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface FossilCardProps {
  fossil: SerializedProduct;
}

export interface FossilFiltersProps {
  selectedCategory?: Category;
  selectedStatus?: ProductStatus;
  selectedPeriod?: GeologicalPeriod;
  onCategoryChange: (category?: Category) => void;
  onStatusChange: (status?: ProductStatus) => void;
  onPeriodChange: (period?: GeologicalPeriod) => void;
  onClearFilters: () => void;
}

// ✅ Type spécifique pour les items du store Zustand (UI)
export interface ClientCartItem {
  id: string;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  category: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

// ✅ Type pour le state Zustand
export interface CartState {
  items: ClientCartItem[]; // ✅ Utiliser ClientCartItem
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

// ✅ Type pour les props du composant CartItem
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

export interface CheckoutButtonProps {
  productId: number;
  priceId: string;
  amount: number;
}

// ✅ Type alias pour clarifier
export type DbCartItem = PrismaCartItem; // Type de la BDD
export type UiCartItem = ClientCartItem; // Type pour l'UI

// ✅ Type pour les items avec produit sérialisé (API responses)
export interface SerializedCartItem {
  id: string;
  cartId: string;
  productId: number;
  quantity: number;
  addedAt: string;
  product: SerializedProduct;
}
