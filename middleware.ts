import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

const locales = ["fr", "en"];
const defaultLocale = "fr";

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return matchLocale(languages, locales, defaultLocale);
}

export default function middleware(request: NextRequest, event: any) {
  const { pathname } = request.nextUrl;
  console.log("[middleware] Pathname:", pathname);

  // Si déjà sur /fr ou /en (juste après le slash), laisse passer
  const match = pathname.match(/^\/(fr|en)(\/|$)/);
  if (match) {
    // Clerk doit s'exécuter sur les routes protégées
    return clerkMiddleware()(request, event);
  }

  // Sinon, détecte la locale préférée et redirige
  const locale = getLocale(request);
  const redirectUrl = `/${locale}${pathname === "/" ? "" : pathname}`;
  console.log("[middleware] Redirection vers:", redirectUrl);
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)", "/(api|trpc)(.*)"],
};
