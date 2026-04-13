import Image from "next/image";
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-12 relative flex flex-col items-center">
            {/* Enhanced halo effect */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-[100%] bg-terracotta/5 blur-[80px] -z-10"></div>

            {/* Fossil icon decoration */}
            <div className="flex items-center justify-center mb-8 relative">
              <div className="relative p-4 md:p-6 rounded-full bg-background shadow-2xl">
                <img
                  src="/logo.svg"
                  alt="Paleolitho Logo"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain filter rounded-full  drop-shadow-[0_0_15px_rgba(205,92,60,0.6)]"
                />
                <div className="absolute inset-0 rounded-full border border-terracotta/30 animate-ping opacity-20 duration-3000"></div>
              </div>
            </div>

            <h1
              className="text-6xl md:text-8xl font-serif font-black tracking-widest text-foreground mb-8 leading-tight drop-shadow-2xl"
              style={{
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              {dict.home.heroTitle}
            </h1>
            <p className="text-2xl text-foreground/80 leading-relaxed max-w-3xl mx-auto font-sans font-light tracking-wide">
              {dict.home.heroSubtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 mt-16">
              <Button
                asChild
                size="lg"
                className="bg-terracotta text-foreground hover:bg-terracotta/90 px-10 py-6 text-xl shadow-[0_0_30px_rgba(217,119,87,0.3)] hover:shadow-[0_0_40px_rgba(217,119,87,0.5)] transition-all duration-300 transform hover:-translate-y-1 rounded-xl border border-terracotta/50 font-bold tracking-wide"
              >
                <Link
                  href={`/${lang}/fossiles`}
                  className="flex items-center gap-3"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {dict.home.discoverCollection}
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-foreground/30 hover:border-foreground hover:bg-foreground/10 text-foreground px-10 py-6 text-xl font-bold tracking-wide transition-all duration-300 rounded-xl shadow-lg backdrop-blur-sm"
              >
                <Link
                  href={`/${lang}/blog`}
                  className="flex items-center gap-3"
                >
                  <BookOpen className="w-6 h-6" />
                  {dict.home.exploreBlog}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative z-10 border-t border-foreground/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="font-serif font-bold text-foreground tracking-widest mb-6 uppercase text-sm opacity-80">
              {dict.home.whyChooseTitle}
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto font-light">
              {dict.home.whyChooseSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Boutique Card - Enhanced */}
            <Card className="-card">
              <CardHeader className="text-center pb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-terracotta/5 to-transparent rounded-t-lg"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-card border border-terracotta/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                    <ShoppingBag className="w-10 h-10 text-terracotta opacity-90 drop-shadow-md group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-3xl font-serif font-bold text-foreground">
                    {dict.home.shopTitle}
                  </CardTitle>
                  <CardDescription className="text-lg text-foreground/70 mt-3 h-14 flex items-center justify-center font-light">
                    {dict.home.shopDesc}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center relative">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center justify-center gap-2 text-foreground/50 font-medium tracking-wide">
                    <Shell className="w-4 h-4 text-terracotta" />
                    <span>{dict.home.authentic}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-foreground/50 font-medium tracking-wide">
                    <MapPin className="w-4 h-4 text-terracotta" />
                    <span>{dict.home.geolocated}</span>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-transparent border border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50 w-full font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
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
            <Card className="-card">
              <CardHeader className="text-center pb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent rounded-t-lg"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-card border border-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                    <BookOpen className="w-10 h-10 text-foreground opacity-80 drop-shadow-md group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-3xl font-serif font-bold text-foreground">
                    {dict.home.blogTitle}
                  </CardTitle>
                  <CardDescription className="text-lg text-foreground/70 mt-3 h-14 flex items-center justify-center font-light">
                    {dict.home.blogDesc}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center relative">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center justify-center gap-2 text-foreground/50 font-medium tracking-wide">
                    <Clock className="w-4 h-4 text-foreground/70" />
                    <span>{dict.home.updated}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-foreground/50 font-medium tracking-wide">
                    <Users className="w-4 h-4 text-foreground/70" />
                    <span>{dict.home.community}</span>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-transparent border border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50 w-full font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
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
      <section className="py-24 px-4 relative z-10 bg-background border-t border-foreground/10">
        <div className="container mx-auto max-w-6xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-terracotta)]/5 to-transparent blur-3xl pointer-events-none"></div>
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4 tracking-wide">
              {dict.home.statsTitle}
            </h2>
            <p className="text-xl text-foreground/70 font-light">
              {dict.home.statsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative z-10">
            <div className="group">
              <div className="bg-card text-card-foreground rounded-2xl p-8 border border-terracotta/20 hover:border-terracotta/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[0_0_30px_rgba(var(--color-terracotta),0.15)]">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <Shell className="w-12 h-12 text-terracotta opacity-90 group-hover:scale-110 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-foreground/50 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-5xl font-black mb-2 text-foreground drop-shadow-lg">
                  500+
                </div>
                <div className="text-foreground/60 font-medium tracking-wide uppercase text-sm">
                  {dict.home.statsFossils}
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-card text-card-foreground rounded-2xl p-8 border border-foreground/20 hover:border-foreground/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[0_0_30px_rgba(var(--color-parchemin),0.05)]">
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="w-12 h-12 text-foreground opacity-80 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-5xl font-black mb-2 text-foreground drop-shadow-lg">
                  50+
                </div>
                <div className="text-foreground/60 font-medium tracking-wide uppercase text-sm">
                  {dict.home.statsArticles}
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-card text-card-foreground rounded-2xl p-8 border border-terracotta/20 hover:border-terracotta/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[0_0_30px_rgba(var(--color-terracotta),0.15)]">
                <div className="flex items-center justify-center mb-4">
                  <Globe className="w-12 h-12 text-terracotta opacity-90 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-5xl font-black mb-2 text-foreground drop-shadow-lg">
                  10k+
                </div>
                <div className="text-foreground/60 font-medium tracking-wide uppercase text-sm">
                  {dict.home.statsVisitors}
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-card text-card-foreground rounded-2xl p-8 border border-foreground/20 hover:border-foreground/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[0_0_30px_rgba(var(--color-parchemin),0.05)]">
                <div className="flex items-center justify-center mb-4">
                  <Star className="w-12 h-12 text-foreground opacity-80 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-5xl font-black mb-2 text-foreground drop-shadow-lg">
                  4.9★
                </div>
                <div className="text-foreground/60 font-medium tracking-wide uppercase text-sm">
                  {dict.home.averageRating}
                </div>
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
          <path
            fill="var(--silex)"
            d="M0,40 Q720,160 1440,40 L1440,120 L0,120 Z"
          />
        </svg>
      </div>
    </div>
  );
}
