import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getAdminCollectionStats,
  getFossilSpecies,
} from "@/lib/actions/collectionActions";
import AdminSpeciesManager from "@/components/collection/adminSpeciesManager";

export default async function AdminCollectionPage({
  params,
}: {
  params: Promise<{ lang: "fr" | "en" }>;
}) {
  const { lang } = await params;

  try {
    await requireAdmin();
  } catch {
    redirect(`/${lang}/dashboard`);
  }

  const [{ items: species }, stats, localities] = await Promise.all([
    getFossilSpecies({ pageSize: 500 }),
    getAdminCollectionStats(),
    prisma.locality.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-silex p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-parchemin font-playfair">
            Gestion du catalogue
          </h1>
          <p className="text-parchemin/60 mt-1">
            Référentiel d&apos;espèces fossiles · Pokédex Paléolitho
          </p>
        </div>

        <AdminSpeciesManager
          species={species}
          localities={localities}
          stats={stats}
        />
      </div>
    </div>
  );
}
