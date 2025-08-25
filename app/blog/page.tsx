import BlogList from "@/components/blog/blogList";
import { getBlogPosts } from "@/lib/actions/blogActions";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");

  const blogData = await getBlogPosts(page);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Découvrez nos articles sur la paléontologie
        </p>
      </div>

      <BlogList {...blogData} />
    </div>
  );
}
