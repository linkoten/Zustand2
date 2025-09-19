import { getBlogArticles } from "@/lib/actions/blogActions";
import BlogCard from "./blogCard";
import { BlogCategory } from "@/lib/generated/prisma";

import { getDictionary } from "@/app/[lang]/dictionaries";

interface RelatedArticlesProps {
  currentArticleId: string;
  category: BlogCategory;
  tags: string[];
  lang: "en" | "fr";
}

export default async function RelatedArticles({
  currentArticleId,
  category,
  lang,
}: RelatedArticlesProps) {
  const dict = await getDictionary(lang);
  // Récupérer d'abord les articles de la même catégorie
  const { articles: categoryArticles } = await getBlogArticles({
    category,
    limit: 6,
  });

  // Filtrer l'article actuel et limiter à 3
  const relatedArticles = categoryArticles
    .filter((article) => article.id !== currentArticleId)
    .slice(0, 3);

  // Si on n'a pas assez d'articles dans la catégorie, prendre des articles récents
  if (relatedArticles.length < 3) {
    const { articles: recentArticles } = await getBlogArticles({
      limit: 6,
    });

    const additionalArticles = recentArticles
      .filter(
        (article) =>
          article.id !== currentArticleId &&
          !relatedArticles.some((related) => related.id === article.id)
      )
      .slice(0, 3 - relatedArticles.length);

    relatedArticles.push(...additionalArticles);
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {dict.blog.exploreCategories}
        </h2>
        <p className="text-gray-600">{dict.blog.relatedArticles.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <BlogCard key={article.id} article={article} lang={lang} />
        ))}
      </div>
    </section>
  );
}
