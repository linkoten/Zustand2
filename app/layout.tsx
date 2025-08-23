import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Configuration de Cinzel comme police principale
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FossilShop - Paléontologie & Fossiles",
  description:
    "Découvrez notre collection de fossiles authentiques et explorez l'univers fascinant de la paléontologie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="fr"
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable}`}
      >
        <body className={`${cinzel.className} antialiased`}>
          <Navbar />
          <main className="flex-1">{children}</main>

          {/* Footer avec police Cinzel */}
          <footer className="border-t bg-muted/50 py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>© 2024 FossilShop. Tous droits réservés.</p>
            </div>
          </footer>

          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
