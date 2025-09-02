"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { EditableBlogPost } from "@/types/blogType";

// ✅ Categories du schéma Prisma
const categories = [
  { value: "PALEONTOLOGIE", label: "Paléontologie" },
  { value: "DECOUVERTE", label: "Découverte" },
  { value: "GUIDE_COLLECTION", label: "Guide Collection" },
  { value: "HISTOIRE_GEOLOGIQUE", label: "Histoire Géologique" },
  { value: "ACTUALITE", label: "Actualité" },
  { value: "TECHNIQUE", label: "Technique" },
  { value: "EXPOSITION", label: "Exposition" },
  { value: "PORTRAIT", label: "Portrait" },
];

// ✅ Status du schéma Prisma
const statusOptions = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "ARCHIVED", label: "Archivé" },
  { value: "SCHEDULED", label: "Programmé" },
];

interface EditBlogFormProps {
  post: EditableBlogPost;
}

export default function EditBlogForm({ post }: EditBlogFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content,
    slug: post.slug,
    category: post.category,
    tags: post.tags.join(", "), // ✅ Joindre les tags
    featuredImage: post.featuredImage || "",
    imageAlt: post.imageAlt || "",
    status: post.status,
    readTime: post.readTime?.toString() || "5",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
          readTime: formData.readTime ? parseInt(formData.readTime) : null,
          featuredImage: formData.featuredImage || null,
          imageAlt: formData.imageAlt || null,
          excerpt: formData.excerpt || null,
          seoTitle: formData.seoTitle || null,
          seoDescription: formData.seoDescription || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success("Article mis à jour avec succès !");
      router.push(`/blog/${formData.slug}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour de l'article");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Titre de l&apos;article *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug URL *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange("slug", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            placeholder="fossile, trilobite, paléozoïque"
          />
        </div>

        <div>
          <Label htmlFor="readTime">Temps de lecture (minutes)</Label>
          <Input
            id="readTime"
            type="number"
            min="1"
            value={formData.readTime}
            onChange={(e) => handleInputChange("readTime", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Statut *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="featuredImage">Image à la une (URL)</Label>
          <Input
            id="featuredImage"
            type="url"
            value={formData.featuredImage}
            onChange={(e) => handleInputChange("featuredImage", e.target.value)}
            placeholder="https://exemple.com/image.jpg"
          />
        </div>

        <div>
          <Label htmlFor="imageAlt">Texte alternatif image</Label>
          <Input
            id="imageAlt"
            value={formData.imageAlt}
            onChange={(e) => handleInputChange("imageAlt", e.target.value)}
            placeholder="Description de l'image pour l'accessibilité"
          />
        </div>

        <div>
          <Label htmlFor="seoTitle">Titre SEO</Label>
          <Input
            id="seoTitle"
            value={formData.seoTitle}
            onChange={(e) => handleInputChange("seoTitle", e.target.value)}
            placeholder="Titre optimisé pour les moteurs de recherche"
          />
        </div>

        <div>
          <Label htmlFor="seoDescription">Description SEO</Label>
          <Input
            id="seoDescription"
            value={formData.seoDescription}
            onChange={(e) =>
              handleInputChange("seoDescription", e.target.value)
            }
            placeholder="Description pour les moteurs de recherche"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Extrait</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleInputChange("excerpt", e.target.value)}
          rows={3}
          placeholder="Résumé court de l'article..."
        />
      </div>

      <div>
        <Label htmlFor="content">Contenu *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange("content", e.target.value)}
          rows={12}
          required
          placeholder="Contenu de l'article en Markdown..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Mettre à jour
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
