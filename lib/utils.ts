import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

// Fonction utilitaire pour générer un slug à partir du titre
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, "") // Supprimer les caractères spéciaux
    .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
    .replace(/-+/g, "-") // Supprimer les tirets multiples
    .trim();
}

// Fonction pour estimer le temps de lecture
export function estimateReadTime(content: string): number {
  const wordsPerMinute = 200; // Vitesse de lecture moyenne
  // Enlever les balises HTML pour compter seulement le texte
  const textContent = content.replace(/<[^>]*>/g, "");
  const wordCount = textContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}
