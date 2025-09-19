// Types pour les interfaces dashboard
export interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

export interface OrderDashboardItem {
  id: string;
  userId: string;
  createdAt: string; // string (format ISO)
  updatedAt: string;
  status: string;
  total: number;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: number;
      title: string;
    };
  }[];
}

export interface UserDashboardData {
  favorites: any[];
  fossilRequests: any[];
  totalFavorites: number;
  totalRequests: number;
  orders: OrderDashboardItem[];
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
