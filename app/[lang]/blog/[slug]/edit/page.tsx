import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditBlogForm from "@/components/blog/editBlogForm";
import EditGisementsForm from "@/components/blog/editGisementsForm";
import EditActivitesForm from "@/components/blog/editActivitesForm";
import { getBlogPost } from "@/lib/actions/blogActions";
import { BlogCategory, UserRole } from "@/lib/generated/prisma";

interface EditBlogPageProps {
  params: Promise<{ slug: string; lang: "en" | "fr" }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug, lang } = await params;

  const user = await requireAdmin();
  const canEdit =
    user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;

  if (!canEdit) {
    notFound();
  }

  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const isGisements = post.category === BlogCategory.GISEMENTS;
  const isActivites = post.category === BlogCategory.ACTIVITES_PALEOLITHO;
  const isFullWidth = isGisements || isActivites;

  return (
    <div
      className={`mx-auto px-4 py-8 ${isFullWidth ? "max-w-full" : "container max-w-4xl"}`}
    >
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/${lang}/blog/${post.slug}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;article
          </Link>
        </Button>
      </div>

      {isGisements ? (
        <>
          <div className="mb-6 px-4">
            <h1 className="text-2xl font-bold text-parchemin">
              Modifier le gisement
            </h1>
            <p className="text-parchemin/60 text-sm mt-1">
              &quot;{post.title}&quot;
            </p>
          </div>
          <EditGisementsForm post={post} lang={lang} />
        </>
      ) : isActivites ? (
        <EditActivitesForm post={post} lang={lang} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Modifier l&apos;article</CardTitle>
            <CardDescription>
              Modifiez les informations de l&apos;article &quot;{post.title}
              &quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditBlogForm post={post} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
