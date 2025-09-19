import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
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

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable}`}
      >
        <body className={`${cinzel.className} antialiased`}>
          <Navbar lang={lang} dict={dict} />
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-muted/50 py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>© 2025 Paleolitho. {dict.home.footerCopyright}</p>
            </div>
          </footer>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
