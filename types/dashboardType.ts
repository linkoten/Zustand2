import { Order } from "@/lib/generated/prisma";

// Types pour les interfaces dashboard
export interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

export interface UserDashboardData {
  favorites: any[];
  fossilRequests: any[];
  totalFavorites: number;
  totalRequests: number;
  orders: Order[];
}

export interface AdminDashboardData {
  fossilRequests: any[];
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalBlogArticles: number;
    totalRequests: number;
    pendingRequests: number;
    availableProducts: number;
    publishedArticles: number;
  };
  recentUsers: any[];
  recentProducts: any[];
}
