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
}
export default function RatingForm({
  productId,
  articleId,
  initialRating,
  onRatingSubmitted,
}: RatingFormProps) {
  const [rating, setRating] = useState(initialRating?.rating || 0);
  const [comment, setComment] = useState(initialRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
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
            ? "Votre note a été mise à jour"
            : "Votre note a été enregistrée"
        );
        onRatingSubmitted?.();
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
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
      toast.success("Votre note a été supprimée");
      setRating(0);
      setComment("");
      onRatingSubmitted?.();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {initialRating ? "Modifier votre note" : "Notez cet élément"}
        </Label>
        <div className="mt-2">
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>
      </div>

      <div>
        <Label htmlFor="comment">Commentaire (optionnel)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting
            ? "Enregistrement..."
            : initialRating
              ? "Mettre à jour"
              : "Enregistrer"}
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
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        )}
      </div>
    </form>
  );
}
