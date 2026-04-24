import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { BlogCategory, UserRole } from "@/lib/generated/prisma";
import { Metadata } from "next";
import CreateArticleForm from "@/components/blog/createArticleForm";
import CreateGisementsForm from "@/components/blog/createGisementsForm";
import CreateActivitesForm from "@/components/blog/createActivitesForm";
import Link from "next/link";
import {
  Mountain,
  BookOpen,
  FlaskConical,
  Pickaxe,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Créer un article - Admin FossilShop",
  description:
    "Interface d'administration pour créer un nouvel article de blog",
  robots: "noindex, nofollow",
};

const CATEGORY_META: Record<
  BlogCategory,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    border: string;
  }
> = {
  GISEMENTS: {
    label: "Gisements",
    description:
      "Documentez un site paléontologique avec sa faune complète : familles, genres et espèces.",
    icon: Mountain,
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/40",
  },
  COLLECTIONS: {
    label: "Collections",
    description:
      "Présentez une sélection thématique de fossiles remarquables de notre catalogue.",
    icon: BookOpen,
    color: "from-purple-500 to-violet-600",
    border: "border-purple-500/40",
  },
  PALEONTOLOGIE: {
    label: "Paléontologie",
    description:
      "Articles de fond sur la paléontologie : découvertes, évolution, techniques de fouille.",
    icon: FlaskConical,
    color: "from-blue-500 to-cyan-600",
    border: "border-blue-500/40",
  },
  ACTIVITES_PALEOLITHO: {
    label: "Activités Paleolitho",
    description:
      "Sorties terrain, ateliers, événements et actualités de Paleolitho.",
    icon: Pickaxe,
    color: "from-orange-500 to-red-600",
    border: "border-orange-500/40",
  },
  AUTRES: {
    label: "Autres",
    description: "Tout autre sujet en lien avec l'univers des fossiles.",
    icon: MoreHorizontal,
    color: "from-gray-500 to-slate-600",
    border: "border-gray-500/40",
  },
};

export default async function CreateArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { lang } = await params;
  const { category } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/${lang}/sign-in`);
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)
  ) {
    redirect(`/${lang}/fossiles`);
  }

  const validCategories = Object.values(BlogCategory) as string[];
  const selectedCategory =
    category && validCategories.includes(category)
      ? (category as BlogCategory)
      : null;

  // ── Category selection screen ──
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-[var(--silex)]">
        <div className="border-b border-[var(--parchemin)]/10">
          <div className="container mx-auto px-4 py-6">
            <Link
              href={`/${lang}/blog`}
              className="inline-flex items-center gap-2 text-[var(--parchemin)]/60 hover:text-[var(--parchemin)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au blog
            </Link>
            <h1 className="text-3xl font-bold text-[var(--parchemin)]">
              Quel type d&apos;article ?
            </h1>
            <p className="text-[var(--parchemin)]/60 mt-2">
              Chaque catégorie dispose d&apos;une structure adaptée à son
              contenu.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(
              Object.entries(CATEGORY_META) as [
                BlogCategory,
                (typeof CATEGORY_META)[BlogCategory],
              ][]
            ).map(([cat, meta]) => {
              const Icon = meta.icon;
              return (
                <Link
                  key={cat}
                  href={`/${lang}/blog/create?category=${cat}`}
                  className={`group relative flex flex-col gap-4 p-6 rounded-2xl bg-[var(--silex)] border ${
                    meta.border
                  } hover:border-[var(--terracotta)]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--parchemin)] mb-1">
                      {meta.label}
                    </h2>
                    <p className="text-sm text-[var(--parchemin)]/60 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="text-xs font-medium text-[var(--terracotta)] group-hover:underline">
                      Créer un article →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Category-specific form ──
  if (selectedCategory === BlogCategory.GISEMENTS) {
    return (
      <div className="min-h-screen bg-[var(--silex)]">
        <div className="border-b border-[var(--parchemin)]/10">
          <div className="container mx-auto px-4 py-6">
            <Link
              href={`/${lang}/blog/create`}
              className="inline-flex items-center gap-2 text-[var(--parchemin)]/60 hover:text-[var(--parchemin)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Changer de catégorie
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--parchemin)]">
                  Nouveau gisement
                </h1>
                <p className="text-sm text-[var(--parchemin)]/60">
                  Documentez un site paléontologique et sa faune
                </p>
              </div>
            </div>
          </div>
        </div>
        <CreateGisementsForm lang={lang} />
      </div>
    );
  }

  if (selectedCategory === BlogCategory.ACTIVITES_PALEOLITHO) {
    return (
      <div className="min-h-screen bg-[var(--silex)]">
        <div className="border-b border-[var(--parchemin)]/10">
          <div className="container mx-auto px-4 py-6">
            <Link
              href={`/${lang}/blog/create`}
              className="inline-flex items-center gap-2 text-[var(--parchemin)]/60 hover:text-[var(--parchemin)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Changer de catégorie
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Pickaxe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--parchemin)]">
                  Nouvelle activité
                </h1>
                <p className="text-sm text-[var(--parchemin)]/60">
                  Salon, fouille, arrivage ou planning éditorial
                </p>
              </div>
            </div>
          </div>
        </div>
        <CreateActivitesForm lang={lang} />
      </div>
    );
  }

  // ── Generic form (all other categories) ──
  const meta = CATEGORY_META[selectedCategory];
  const Icon = meta.icon;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/${lang}/blog/create`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Changer de catégorie
          </Link>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nouvel article — {meta.label}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <CreateArticleForm defaultCategory={selectedCategory} />
    </div>
  );
}
