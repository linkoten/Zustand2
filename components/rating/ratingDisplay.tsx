"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Star } from "lucide-react";
import RatingForm from "./ratingForm";
import StarRating from "./starRating";
import { RatingStats, UserRating } from "@/types/ratingType";

interface RatingDisplayProps {
  stats: RatingStats;
  userRating?: UserRating;
  productId?: number;
  articleId?: string;
  showForm?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function RatingDisplay({
  stats,
  userRating,
  productId,
  articleId,
  showForm = true,
  dict,
}: RatingDisplayProps) {
  const [showRatingForm, setShowRatingForm] = useState(false);

  const handleRatingSubmitted = () => {
    setShowRatingForm(false);
    // La page sera revalidée automatiquement
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {dict?.rating?.title || "Notations"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques globales */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
            </div>
            <StarRating rating={stats.averageRating} readonly size="md" />
            <div className="text-sm text-muted-foreground mt-1">
              {stats.totalRatings} {dict?.rating?.reviews || "avis"}
            </div>
          </div>

          {/* Distribution des notes */}
          {stats.totalRatings > 0 && (
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{star}</span>
                  <Star className="h-3 w-3 fill-current" />
                  <Progress
                    value={
                      (stats.ratingDistribution[
                        star as keyof typeof stats.ratingDistribution
                      ] /
                        stats.totalRatings) *
                      100
                    }
                    className="flex-1 h-2"
                  />
                  <span className="w-8 text-muted-foreground">
                    {
                      stats.ratingDistribution[
                        star as keyof typeof stats.ratingDistribution
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note de l'utilisateur ou formulaire */}
        {showForm && (
          <div className="border-t pt-6">
            {userRating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {dict?.rating?.yourRating || "Votre note"}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRatingForm(!showRatingForm)}
                  >
                    {showRatingForm
                      ? dict?.rating?.cancel || "Annuler"
                      : dict?.rating?.edit || "Modifier"}
                  </Button>
                </div>

                {!showRatingForm && (
                  <div className="space-y-2">
                    <StarRating rating={userRating.rating} readonly />
                    {userRating.comment && (
                      <p className="text-sm text-muted-foreground italic">
                        &quot;{userRating.comment}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium">
                  {dict?.rating?.giveYourReview || "Donnez votre avis"}
                </h4>
                {!showRatingForm && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRatingForm(true)}
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {dict?.rating?.rateThisItem || "Noter cet élément"}
                  </Button>
                )}
              </div>
            )}

            {showRatingForm && (
              <div className="mt-4">
                <RatingForm
                  productId={productId}
                  articleId={articleId}
                  initialRating={userRating}
                  onRatingSubmitted={handleRatingSubmitted}
                  dict={dict}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
