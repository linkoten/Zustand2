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

export interface UserDashboardProps {
  user: DashboardUser;
  data: UserDashboardData;
}

export interface AdminDashboardProps {
  user: DashboardUser;
  data: AdminDashboardData;
}
