import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingBag, ArrowRight } from "lucide-react";
import { getDictionary } from "./dictionaries";
import { FEATURES } from "@/lib/config/features";

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
              {FEATURES.blog && (
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
              )}
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
