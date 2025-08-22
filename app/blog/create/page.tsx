import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma";
import { Metadata } from "next";
import CreateArticleForm from "@/components/blog/createArticleForm";

export const metadata: Metadata = {
  title: "Créer un article - Admin FossilShop",
  description:
    "Interface d'administration pour créer un nouvel article de blog",
  robots: "noindex, nofollow",
};

export default async function CreateArticlePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Vérifier que l'utilisateur a les droits d'administration
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)
  ) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Créer un nouvel article
              </h1>
              <p className="text-gray-600 mt-2">
                Rédigez et publiez un nouvel article pour le blog
              </p>
            </div>
          </div>
        </div>
      </div>

      <CreateArticleForm />
    </div>
  );
}
