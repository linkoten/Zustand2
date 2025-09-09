import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/navbar";
import { getDictionary } from "@/lib/i18n"; // 👈 Import du dictionnaire

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// 👇 Fonction pour générer les métadonnées traduites
export async function generateMetadata({
  params,
}: {
  params: { locale: "fr" | "en" };
}): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  return {
    title: dict.siteTitle || "FossilShop",
    description:
      dict.siteDescription ||
      "Découvrez notre collection de fossiles authentiques et explorez l'univers fascinant de la paléontologie",
  };
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: "fr" | "en" };
}>) {
  const dict = getDictionary(params.locale);

  return (
    <ClerkProvider>
      <html
        lang={params.locale}
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable}`}
      >
        <body className={`${cinzel.className} antialiased`}>
          <Navbar locale={params.locale} />
          <main className="flex-1">{children}</main>

          {/* Footer traduit */}
          <footer className="border-t bg-muted/50 py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>
                © 2025 Paleolitho.{" "}
                {dict.footerCopyright || "Tous droits réservés."}
              </p>
            </div>
          </footer>

          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
