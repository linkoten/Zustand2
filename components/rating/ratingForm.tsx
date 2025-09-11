"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserRating } from "@/types/ratingType";
import { Trash2 } from "lucide-react";
import StarRating from "./starRating";
import { createOrUpdateRating } from "@/lib/actions/ratingActions";

export interface RatingFormProps {
  productId?: number;
  articleId?: string;
  initialRating?: UserRating;
  onRatingSubmitted?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}
export default function RatingForm({
  productId,
  articleId,
  initialRating,
  onRatingSubmitted,
  dict,
}: RatingFormProps) {
  const [rating, setRating] = useState(initialRating?.rating || 0);
  const [comment, setComment] = useState(initialRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(
        dict?.ratingForm?.selectRating || "Veuillez sélectionner une note"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrUpdateRating({
        rating,
        comment: comment.trim() || undefined,
        productId,
        articleId,
      });

      if (result.success) {
        toast.success(
          initialRating
            ? dict?.ratingForm?.updated || "Votre note a été mise à jour"
            : dict?.ratingForm?.saved || "Votre note a été enregistrée"
        );
        onRatingSubmitted?.();
      } else {
        toast.error(
          result.error ||
            dict?.ratingForm?.saveError ||
            "Erreur lors de l'enregistrement"
        );
      }
    } catch (error) {
      toast.error(
        dict?.ratingForm?.saveError || "Erreur lors de l'enregistrement"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialRating) return;

    setIsDeleting(true);
    try {
      // Note: Il faudrait passer l'ID de la notation ici
      // Pour simplifier, on pourrait récupérer l'ID via une action supplémentaire
      toast.success(dict?.ratingForm?.deleted || "Votre note a été supprimée");
      setRating(0);
      setComment("");
      onRatingSubmitted?.();
    } catch (error) {
      toast.error(
        dict?.ratingForm?.deleteError || "Erreur lors de la suppression"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {initialRating
            ? dict?.ratingForm?.editYourRating || "Modifier votre note"
            : dict?.ratingForm?.rateThisItem || "Notez cet élément"}
        </Label>
        <div className="mt-2">
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>
      </div>

      <div>
        <Label htmlFor="comment">
          {dict?.ratingForm?.commentLabel || "Commentaire (optionnel)"}
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            dict?.ratingForm?.commentPlaceholder ||
            "Partagez votre expérience..."
          }
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting
            ? dict?.ratingForm?.saving || "Enregistrement..."
            : initialRating
              ? dict?.ratingForm?.update || "Mettre à jour"
              : dict?.ratingForm?.save || "Enregistrer"}
        </Button>

        {initialRating && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting
              ? dict?.ratingForm?.deleting || "Suppression..."
              : dict?.ratingForm?.delete || "Supprimer"}
          </Button>
        )}
      </div>
    </form>
  );
}
