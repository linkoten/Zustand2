import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  ShoppingBag,
  ArrowRight,
  Globe,
  Star,
  Shell,
  MapPin,
  Clock,
  Users,
} from "lucide-react";
import { getDictionary } from "./dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-stone-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-blue-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-stone-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-12 relative flex flex-col items-center">
            {/* Enhanced halo effect */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full bg-gradient-to-r from-amber-200/40 via-yellow-200/40 to-orange-200/40 blur-3xl -z-10 animate-pulse"></div>

            {/* Fossil icon decoration */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Shell className="w-16 h-16 text-amber-600 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-bounce"></div>
              </div>
            </div>

            <h1
              className="text-6xl md:text-8xl font-black tracking-tight bg-gradient-to-br from-amber-700 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-8 leading-tight"
              style={{
                letterSpacing: "-0.02em",
                textShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              {dict.home.heroTitle}
            </h1>
            <p className="text-2xl text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {dict.home.heroSubtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link
                  href={`/${lang}/fossiles`}
                  className="flex items-center gap-3"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {dict.home.discoverCollection}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                <Link
                  href={`/${lang}/blog`}
                  className="flex items-center gap-3"
                >
                  <BookOpen className="w-5 h-5" />
                  {dict.home.exploreBlog}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              {dict.home.whyChooseTitle}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {dict.home.whyChooseSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Boutique Card - Enhanced */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-amber-50/50 to-amber-100/30 hover:scale-105 transform">
              <CardHeader className="text-center pb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-t-lg"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <ShoppingBag className="w-12 h-12 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-800">
                    {dict.home.shopTitle}
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600 mt-3 h-14 flex items-center justify-center">
                    {dict.home.shopDesc}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center relative">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Shell className="w-4 h-4 text-amber-600" />
                    <span>{dict.home.authentic}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>{dict.home.geolocated}</span>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 w-full text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link
                    href={`/${lang}/fossiles`}
                    className="flex items-center justify-center gap-3"
                  >
                    {dict.home.shopBtn}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Blog Card - Enhanced */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 hover:scale-105 transform">
              <CardHeader className="text-center pb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-t-lg"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-800">
                    {dict.home.blogTitle}
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600 mt-3 h-14 flex items-center justify-center">
                    {dict.home.blogDesc}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center relative">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{dict.home.updated}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{dict.home.community}</span>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white w-full font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link
                    href={`/${lang}/blog`}
                    className="flex items-center justify-center gap-3"
                  >
                    {dict.home.blogBtn}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 px-4 relative z-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {dict.home.statsTitle}
            </h2>
            <p className="text-xl text-slate-300">
              {dict.home.statsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/30 rounded-2xl p-8 border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <Shell className="w-12 h-12 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-5xl font-black mb-2 bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-slate-300 font-medium">
                  {dict.home.statsFossils}
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-5xl font-black mb-2 bg-gradient-to-br from-blue-300 to-blue-500 bg-clip-text text-transparent">
                  50+
                </div>
                <div className="text-slate-300 font-medium">
                  {dict.home.statsArticles}
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <Globe className="w-12 h-12 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-5xl font-black mb-2 bg-gradient-to-br from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  10k+
                </div>
                <div className="text-slate-300 font-medium">
                  {dict.home.statsVisitors}
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <Star className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-5xl font-black mb-2 bg-gradient-to-br from-purple-300 to-purple-500 bg-clip-text text-transparent">
                  4.9★
                </div>
                <div className="text-slate-300 font-medium">{dict.home.averageRating}</div>
              </div>
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
