import {
  Category,
  GeologicalPeriod,
  ProductStatus,
  CartItem as PrismaCartItem,
  BlogCategory,
  BlogStatus,
  Locality, // ✅ Renommer pour éviter le conflit
} from "@/lib/generated/prisma";
import { RatingStats } from "./ratingType";

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
  amount_total?: number | null;
  metadata?: Record<string, string> | null;
  // ✅ Ajouter shipping_details
  shipping_details?: {
    address?: {
      country?: string | null;
      city?: string | null;
      line1?: string | null;
      line2?: string | null;
      postal_code?: string | null;
      state?: string | null;
    } | null;
    name?: string | null;
  } | null;
}
export interface SerializedProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  order: number;
  createdAt: string;
}

// ✅ Type avec price converti en number
export interface SerializedProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  genre: string;
  species: string;
  countryOfOrigin: string;
  locality: Locality;
  geologicalPeriod: string;
  geologicalStage: string;
  description?: string;
  stripePriceId?: string | null;
  weight: number; // ✅ Nouveau champ obligatoire en grammes

  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  averageRating?: number;
  totalRatings?: number;
  ratingStats: RatingStats;

  images: SerializedProductImage[]; // ✅ Array d'images au lieu d'une seule
}

/*export interface FossilFiltersProps {
  selectedCategory?: Category;
  selectedStatus?: ProductStatus;
  selectedPeriod?: GeologicalPeriod;
  onCategoryChange: (category?: Category) => void;
  onStatusChange: (status?: ProductStatus) => void;
  onPeriodChange: (period?: GeologicalPeriod) => void;
  onClearFilters: () => void;
} */

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
  product: {
    title: string;
    price: number;
    category: string;
  };
  imageUrl: string;
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

// ✅ Type pour le panier sérialisé
export interface SerializedCart {
  id: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  items: SerializedCartItem[];
}

export interface CheckoutRequest {
  cartItems: SerializedCartItem[];
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

/*export interface CheckoutFormProps {
  cart: SerializedCart;
}

export interface OrderSummaryProps {
  cart: SerializedCart;
}

export interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
} */

// ✅ Type pour un produit dans le panier (sans images pour optimiser)
export interface CartProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  genre: string;
  species: string;
  countryOfOrigin: string;
  locality: string;
  geologicalPeriod: string;
  geologicalStage: string;
  description?: string;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  weight: number; // ✅ Nouveau champ obligatoire en grammes
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Type pour les items du panier (avec produit sans images)
export interface CartItemData {
  id: string;
  cartId: string;
  productId: number;
  quantity: number;
  addedAt: string;
  product: CartProduct; // ✅ Produit sans images
}

// ✅ Type pour le panier complet
export interface CartData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItemData[];
}

// Garder les anciens types pour la compatibilité avec d'autres parties
export interface SerializedProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  order: number;
  createdAt: string;
}

export interface SerializedBlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface SerializedArticleBlog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  imageAlt?: string;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt?: string;
  readTime?: number;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: {
    id: number;
    name?: string;
    email: string;
  };
  tags: SerializedBlogTag[];
}

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  imageAlt?: string;
  category: BlogCategory;
  publishedAt?: string;
  readTime?: number;
  views: number;
  author: {
    name?: string;
    email: string;
  };
  tags: SerializedBlogTag[];
}
