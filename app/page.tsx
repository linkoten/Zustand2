import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gem, BookOpen, ShoppingBag, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <Gem className="w-16 h-16 text-amber-600 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              FossilShop
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Découvrez notre collection de fossiles authentiques et explorez
              l'univers fascinant de la paléontologie à travers nos articles.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Boutique */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-200">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
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
                    href="/fossils"
                    className="flex items-center justify-center gap-2"
                  >
                    Voir les fossiles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Blog */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
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
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full"
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

      {/* Stats simples */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-600 mb-2">500+</div>
              <div className="text-gray-600">Fossiles disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Articles de blog</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-600 mb-2">10k+</div>
              <div className="text-gray-600">Visiteurs par mois</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 px-4 bg-white border-t">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gem className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-gray-900">FossilShop</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; 2024 FossilShop. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
