"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Save, Eye, Clock, Minimize, Maximize } from "lucide-react";
import { BlogCategory, BlogStatus, BlogTag } from "@/lib/generated/prisma";

import { toast } from "sonner";
import RichTextEditor from "./richTextEditor";

import { Switch } from "../ui/switch";
import { estimateReadTime, generateSlug } from "@/lib/utils";
import {
  createBlogArticle,
  createBlogTag,
  getAllBlogTags,
} from "@/lib/actions/blogActions";

const categories = [
  { value: BlogCategory.PALEONTOLOGIE, label: "Paléontologie" },
  { value: BlogCategory.DECOUVERTE, label: "Découverte" },
  { value: BlogCategory.GUIDE_COLLECTION, label: "Guide Collection" },
  { value: BlogCategory.HISTOIRE_GEOLOGIQUE, label: "Histoire Géologique" },
  { value: BlogCategory.ACTUALITE, label: "Actualité" },
  { value: BlogCategory.TECHNIQUE, label: "Technique" },
  { value: BlogCategory.EXPOSITION, label: "Exposition" },
  { value: BlogCategory.PORTRAIT, label: "Portrait" },
];

export default function CreateArticleForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<BlogTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Données du formulaire
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    imageAlt: "",
    category: "" as BlogCategory | "",
    status: BlogStatus.DRAFT,
    publishedAt: "",
    seoTitle: "",
    seoDescription: "",
    selectedTags: [] as string[],
  });

  // Auto-génération du slug
  const [autoSlug, setAutoSlug] = useState(true);

  // Charger les tags disponibles
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllBlogTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error("Erreur chargement tags:", error);
      }
    };
    loadTags();
  }, []);

  // Auto-génération du slug
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, autoSlug]);

  // ✅ NOUVEAU : Gérer le mode plein écran
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((id) => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const result = await createBlogTag(newTagName.trim());
      if (result.success) {
        setAvailableTags((prev) => [...prev, result.tag]);
        setFormData((prev) => ({
          ...prev,
          selectedTags: [...prev.selectedTags, result.tag.id],
        }));
        setNewTagName("");
        toast.success("Tag créé avec succès");
      }
    } catch (error) {
      toast.error("Erreur lors de la création du tag");
      console.error(error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSubmit = async (status: BlogStatus) => {
    if (!formData.title || !formData.content || !formData.category) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const articleData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || undefined,
        content: formData.content,
        featuredImage: formData.featuredImage || undefined,
        imageAlt: formData.imageAlt || undefined,
        category: formData.category as BlogCategory,
        status,
        publishedAt: status === BlogStatus.PUBLISHED ? new Date() : undefined,
        readTime: estimateReadTime(formData.content),
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        tagIds: formData.selectedTags,
      };

      const result = await createBlogArticle(articleData);

      if (result.success) {
        toast.success(
          `Article ${status === BlogStatus.PUBLISHED ? "publié" : "sauvegardé"} avec succès`
        );
        router.push(`/blog/${result.article.slug}`);
      }
    } catch (error: unknown) {
      // ✅ Gestion typée de l'erreur
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'article";

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedReadTime = estimateReadTime(formData.content);

  // ✅ NOUVEAU : Composant éditeur plein écran
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Header plein écran fixe */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {formData.title || "Nouvel article"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{estimatedReadTime} min</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSubmit(BlogStatus.DRAFT)}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="ghost"
              size="sm"
              title="Quitter le mode plein écran (Echap)"
            >
              <Minimize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ✅ Éditeur plein écran avec hauteur correcte */}
        <div className="flex-1 min-h-0">
          <RichTextEditor
            content={formData.content}
            onChange={(content) => handleInputChange("content", content)}
            placeholder="Commencez à écrire votre article..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale - Contenu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Titre et slug */}
          <Card>
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de l&apos;article *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ex: Les trilobites du Paléozoïque"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <div className="flex items-center space-x-2">
                    <Switch checked={autoSlug} onCheckedChange={setAutoSlug} />
                    <span className="text-sm text-gray-600">Auto</span>
                  </div>
                </div>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  disabled={autoSlug}
                  placeholder="trilobites-paleozoique"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /blog/{formData.slug || "votre-slug"}
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Résumé (optionnel)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  placeholder="Bref résumé de l'article affiché dans la liste"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contenu principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contenu de l&apos;article</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{estimatedReadTime} min de lecture</span>
                  </div>
                  {/* ✅ NOUVEAU : Bouton plein écran */}
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    variant="outline"
                    size="sm"
                    title="Mode plein écran"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange("content", content)}
                placeholder="Commencez à écrire votre article..."
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>Optimisation SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">Titre SEO (optionnel)</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) =>
                    handleInputChange("seoTitle", e.target.value)
                  }
                  placeholder="Titre optimisé pour les moteurs de recherche"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">
                  Description SEO (optionnel)
                </Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) =>
                    handleInputChange("seoDescription", e.target.value)
                  }
                  placeholder="Description pour les moteurs de recherche"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale - Métadonnées */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSubmit(BlogStatus.DRAFT)}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder brouillon
              </Button>

              <Button
                onClick={() => handleSubmit(BlogStatus.PUBLISHED)}
                disabled={isLoading}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Publier l&apos;article
              </Button>
            </CardContent>
          </Card>

          {/* Catégorie */}
          <Card>
            <CardHeader>
              <CardTitle>Catégorie *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Image mise en avant */}
          <Card>
            <CardHeader>
              <CardTitle>Image mise en avant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featuredImage">URL de l&apos;image</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) =>
                    handleInputChange("featuredImage", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="imageAlt">Texte alternatif</Label>
                <Input
                  id="imageAlt"
                  value={formData.imageAlt}
                  onChange={(e) =>
                    handleInputChange("imageAlt", e.target.value)
                  }
                  placeholder="Description de l'image"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tags sélectionnés */}
              {formData.selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTags.map((tagId) => {
                    const tag = availableTags.find((t) => t.id === tagId);
                    if (!tag) return null;

                    return (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleTagToggle(tagId)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Liste des tags disponibles */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableTags
                  .filter((tag) => !formData.selectedTags.includes(tag.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                    >
                      #{tag.name}
                    </button>
                  ))}
              </div>

              <Separator />

              {/* Créer un nouveau tag */}
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nouveau tag"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={isCreatingTag || !newTagName.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
