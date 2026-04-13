import type { Metadata } from "next";
import { Playfair_Display, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/navbar";
import { getDictionary } from "./dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "fr" | "en" }>; // ✅ Corriger le nom du paramètre
}): Promise<Metadata> {
  const { lang } = await params; // ✅ Utiliser 'lang' au lieu de 'locale'
  const dict = await getDictionary(lang);
  return {
    title: dict.home.siteTitle,
    description: dict.home.siteDescription,
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: "fr" | "en" }>; // ✅ Corriger le nom du paramètre
}>) {
  const { lang } = await params; // ✅ Utiliser 'lang' au lieu de 'locale'
  const dict = await getDictionary(lang);

  return (
    <ClerkProvider>
      <html
        lang={lang} // ✅ Utiliser 'lang' directement
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} dark`}
      >
        <body
          className={`${geistSans.className} bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground`}
        >
          <Navbar lang={lang} dict={dict} />
          {/* Global animated background blobs */}
          <div
            className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
            aria-hidden="true"
          >
            <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--terracotta)]/8 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute top-40 right-20 w-48 h-48 bg-amber-900/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-[var(--parchemin)]/5 rounded-full blur-[100px] animate-pulse delay-2000"></div>
            <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-[var(--terracotta)]/6 rounded-full blur-[100px] animate-pulse delay-500"></div>
          </div>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/40 bg-zinc-950/50 py-6 mt-12 backdrop-blur-sm">
            <div className="container mx-auto px-4 text-center text-sm text-foreground/60">
              <p>© 2025 Paleolitho. {dict.home.footerCopyright}</p>
            </div>
          </footer>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
