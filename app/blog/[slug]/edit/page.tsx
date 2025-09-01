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
import { getBlogPost } from "@/lib/actions/blogActions";
import { UserRole } from "@/lib/generated/prisma";

interface EditBlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug } = await params;

  // ✅ Vérifier que l'utilisateur est admin ou modérateur
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;article
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Modifier l&apos;article</CardTitle>
          <CardDescription>
            Modifiez les informations de l&apos;article &quot;{post.title}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditBlogForm post={post} />
        </CardContent>
      </Card>
    </div>
  );
}
