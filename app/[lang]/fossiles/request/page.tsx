import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Sparkles,
  Search,
  Lightbulb,
  Clock,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FossilRequestForm from "@/components/fossils/fossilRequestForm";
import { getDictionary } from "../../dictionaries";

export default async function FossilRequestPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 hover:bg-white/80 backdrop-blur-sm"
          >
            <Link
              href={`/${lang}/fossiles`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {dict?.fossilRequest?.backToFossils || "Retour aux fossiles"}
            </Link>
          </Button>

          {/* En-tête avec animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {dict?.fossilRequest?.requestHub || "Centre de demandes"}
              </span>
            </div>

            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {dict?.fossilRequest?.title || "Demande de recherche de fossile"}{" "}
              🔍
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {dict?.fossilRequest?.description ||
                "Vous recherchez un fossile spécifique ? Décrivez-nous ce que vous cherchez et nous vous aiderons à le trouver dans notre réseau de partenaires."}
            </p>
          </div>

          {/* Avantages du service */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="group border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {dict?.fossilRequest?.expertSearchTitle ||
                    "Recherche d'experts"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {dict?.fossilRequest?.expertSearchDesc ||
                    "Notre équipe de paléontologues utilise son expertise et son réseau pour trouver le fossile de vos rêves."}
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {dict?.fossilRequest?.fastResponseTitle || "Réponse rapide"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {dict?.fossilRequest?.fastResponseDesc ||
                    "Nous vous contactons sous 24-48h avec des propositions personnalisées adaptées à votre budget."}
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {dict?.fossilRequest?.authenticityTitle ||
                    "Authenticité garantie"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {dict?.fossilRequest?.authenticityDesc ||
                    "Tous nos fossiles sont authentifiés et accompagnés de leur certificat de provenance."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-3">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  {dict?.fossilRequest?.formTitle || "Formulaire de demande"}
                </CardTitle>
                <CardDescription className="text-lg text-slate-600">
                  {dict?.fossilRequest?.formDescription ||
                    "Remplissez ce formulaire pour nous aider à trouver le fossile parfait pour vous."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <FossilRequestForm dict={dict} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec conseils */}
          <div className="lg:col-span-1 space-y-6">
            {/* Conseils */}
            <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-amber-900">
                  <Lightbulb className="h-5 w-5" />
                  {dict?.fossilRequest?.tipsTitle ||
                    "Conseils pour votre demande"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">
                        {dict?.fossilRequest?.tip1Title || "Soyez précis"}
                      </h4>
                      <p className="text-sm text-amber-700">
                        {dict?.fossilRequest?.tip1Desc ||
                          "Plus votre description est détaillée, mieux nous pourrons vous aider à trouver le fossile idéal."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">
                        {dict?.fossilRequest?.tip2Title ||
                          "Indiquez votre budget"}
                      </h4>
                      <p className="text-sm text-amber-700">
                        {dict?.fossilRequest?.tip2Desc ||
                          "Cela nous aide à vous proposer des options adaptées à vos moyens."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">
                        {dict?.fossilRequest?.tip3Title ||
                          "Mentionnez vos préférences"}
                      </h4>
                      <p className="text-sm text-amber-700">
                        {dict?.fossilRequest?.tip3Desc ||
                          "Époque géologique, taille, état de conservation... tous les détails comptent !"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processus */}
            <Card className="border-0 bg-gradient-to-r from-emerald-50 to-green-50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-emerald-900">
                  <Clock className="h-5 w-5" />
                  {dict?.fossilRequest?.processTitle || "Notre processus"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 text-sm">
                        {dict?.fossilRequest?.step1Title ||
                          "Analyse de votre demande"}
                      </h4>
                      <p className="text-xs text-emerald-700">
                        {dict?.fossilRequest?.step1Desc || "Sous 24h"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 text-sm">
                        {dict?.fossilRequest?.step2Title ||
                          "Recherche dans notre réseau"}
                      </h4>
                      <p className="text-xs text-emerald-700">
                        {dict?.fossilRequest?.step2Desc || "2-7 jours"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 text-sm">
                        {dict?.fossilRequest?.step3Title ||
                          "Proposition personnalisée"}
                      </h4>
                      <p className="text-xs text-emerald-700">
                        {dict?.fossilRequest?.step3Desc || "Photos et prix"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {dict?.fossilRequest?.contactTitle || "Besoin d'aide ?"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 mb-4">
                  {dict?.fossilRequest?.contactDesc ||
                    "Notre équipe est disponible pour répondre à vos questions."}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Link href={`/${lang}/contact`}>
                    {dict?.fossilRequest?.contactButton || "Nous contacter"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
