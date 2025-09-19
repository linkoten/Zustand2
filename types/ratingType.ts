export interface Rating {
  id: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
  productId?: number;
  articleId?: string;
}

export interface CreateRatingData {
  rating: number;
  comment?: string;
  productId?: number;
  articleId?: string;
}

export interface UpdateRatingData {
  rating: number;
  comment?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface UserRating {
  rating: number;
  comment?: string;
  canEdit: boolean;
}
