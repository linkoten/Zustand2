import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, ShoppingBag, ArrowRight, Globe, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8 relative flex flex-col items-center">
            {/* Halo lumineux derrière le titre */}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[120px] rounded-full bg-amber-100 blur-3xl opacity-70 -z-10" />
            <h1
              className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-amber-600 via-amber-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg mb-8"
              style={{
                letterSpacing: "0.04em",
                textShadow: "0 4px 24px rgba(0,0,0,0.08)",
              }}
            >
              Paleolitho
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Découvrez notre collection de fossiles authentiques et explorez
              l&apos;univers fascinant de la paléontologie à travers nos
              articles.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Boutique */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-200 bg-gradient-to-br from-amber-50/60 to-white">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors shadow-md">
                  <ShoppingBag className="w-10 h-10 text-amber-600" />
                </div>
                <CardTitle className="text-2xl">Boutique</CardTitle>
                <CardDescription className="text-base">
                  Explorez notre collection de fossiles authentiques
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700 w-full"
                >
                  <Link
                    href="/fossiles"
                    className="flex items-center justify-center gap-2"
                  >
                    Voir les fossiles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Blog */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50/60 to-white">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors shadow-md">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Blog</CardTitle>
                <CardDescription className="text-base">
                  Approfondissez vos connaissances en paléontologie
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  <Link
                    href="/blog"
                    className="flex items-center justify-center gap-2"
                  >
                    Lire les articles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats simples avec icônes décoratives */}
      <section className="py-16 px-4 bg-gray-50 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="w-7 h-7 text-amber-400 mr-2" />
                <span className="text-4xl font-bold text-amber-600">500+</span>
              </div>
              <div className="text-gray-600">Fossiles disponibles</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-7 h-7 text-blue-400 mr-2" />
                <span className="text-4xl font-bold text-blue-600">50+</span>
              </div>
              <div className="text-gray-600">Articles de blog</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-7 h-7 text-gray-400 mr-2" />
                <span className="text-4xl font-bold text-gray-600">10k+</span>
              </div>
              <div className="text-gray-600">Visiteurs par mois</div>
            </div>
          </div>
        </div>
      </section>

      {/* Décorations SVG bottom */}
      <div className="absolute left-0 bottom-0 w-full pointer-events-none z-0">
        <svg
          width="100%"
          height="120"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#e0e7ff" d="M0,40 Q720,160 1440,40 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
}
