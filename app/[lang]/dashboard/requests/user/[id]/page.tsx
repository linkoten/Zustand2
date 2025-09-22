import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/actions/dashboardActions";
import { getFossilRequestById } from "@/lib/actions/fossilRequestsActions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import FossilRequestDetail from "@/components/fossilRequests/fossilRequestDetail";
import { getDictionary } from "@/app/[lang]/dictionaries";

interface UserFossilRequestDetailPageProps {
  params: Promise<{ id: string; lang: "en" | "fr" }>;
}

export default async function UserFossilRequestDetailPage({
  params,
}: UserFossilRequestDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const { id, lang } = await params;
  const request = await getFossilRequestById(id);

  const dict = await getDictionary(lang);

  if (!request) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 hover:bg-white/80 backdrop-blur-sm"
          >
            <Link
              href={`/${lang}/dashboard/requests/user`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {dict.fossilRequests?.backToRequests || "Retour aux demandes"}
            </Link>
          </Button>

          {/* En-tête avec animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {dict.fossilRequests?.requestDetailHub ||
                  "Détail de ma demande"}
              </span>
            </div>

            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {dict.fossilRequests?.requestDetailTitle ||
                "Ma demande de fossile"}{" "}
              🦖
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {dict.fossilRequests?.requestDetailSubtitle ||
                "Suivez l'évolution de votre demande en temps réel"}
            </p>
          </div>
        </div>

        {/* Détail de la demande */}
        <FossilRequestDetail request={request} dict={dict} />
      </div>
    </div>
  );
}
