import { BlogCategory } from "@/lib/generated/prisma";
import { getBlogArticles } from "./getBlogArticles";
import BlogCard from "./blogCard";
import BlogPagination from "./blogPagination";

interface BlogListProps {
  filters: {
    category?: BlogCategory;
    tag?: string;
    search?: string;
    page: number;
    limit: number;
  };
}

export default async function BlogList({ filters }: BlogListProps) {
  const { articles, totalCount, totalPages, currentPage } =
    await getBlogArticles(filters);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold mb-2">Aucun article trouvé</h3>
        <p className="text-gray-600">
          {filters.search || filters.category || filters.tag
            ? "Essayez de modifier vos critères de recherche."
            : "Les articles seront bientôt disponibles."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Compteur de résultats */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {totalCount} article{totalCount > 1 ? "s" : ""} trouvé
          {totalCount > 1 ? "s" : ""}
        </p>
      </div>

      {/* Grille des articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {articles.map((article) => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}
