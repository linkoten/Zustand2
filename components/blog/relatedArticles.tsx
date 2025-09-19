import { getBlogArticles } from "@/lib/actions/blogActions";
import BlogCard from "./blogCard";
import { BlogCategory } from "@/lib/generated/prisma";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
} from "lucide-react";

interface RelatedArticlesProps {
  currentArticleId: string;
  category: BlogCategory;
  tags: string[];
  lang: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default async function RelatedArticles({
  currentArticleId,
  category,
  lang,
  dict,
}: RelatedArticlesProps) {
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
    <section className="relative">
      {/* Background décoratif premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-3xl" />
      <div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl" />

      <div className="relative p-8 md:p-12">
        {/* Header ultra moderne */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Icône premium avec gradient */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-30" />
              <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-2xl shadow-xl">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Badge contextuel */}
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-full px-4 py-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                {dict.blog?.relatedArticles?.recommendedLabel || "Recommandés"}
              </span>
            </div>
          </div>

          {/* Titre spectaculaire */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              {dict.blog?.relatedArticles?.title || "Articles connexes"}
            </span>
          </h2>

          {/* Sous-titre premium */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent rounded-2xl" />
            <p className="relative text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-6 py-4">
              {dict.blog?.relatedArticles?.subtitle ||
                "Découvrez d'autres articles qui pourraient vous intéresser"}
            </p>
          </div>

          {/* Indicateurs statistiques */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">
                {relatedArticles.length}{" "}
                {dict.blog?.relatedArticles?.articlesLabel || "articles"}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-slate-700">
                {dict.blog?.relatedArticles?.categoryMatch || "Même catégorie"}
              </span>
            </div>
          </div>
        </div>

        {/* Grid des articles avec animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedArticles.map((article, index) => (
            <div
              key={article.id}
              className="group transform transition-all duration-500 hover:scale-[1.02] animate-fadeInUp"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              <BlogCard article={article} lang={lang} dict={dict} />
            </div>
          ))}
        </div>

        {/* Call to action footer */}
        <div className="text-center mt-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-8 py-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-slate-800 mb-1">
                    {dict.blog?.relatedArticles?.exploreMore ||
                      "Explorez plus d'articles"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {dict.blog?.relatedArticles?.discoverMore ||
                      "Découvrez tous nos articles sur la paléontologie"}
                  </p>
                </div>

                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
                  <span>
                    {dict.blog?.relatedArticles?.seeAllButton ||
                      "Voir tous les articles"}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
