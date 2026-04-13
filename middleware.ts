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

export default clerkMiddleware(async (_auth, request) => {
  const { pathname } = request.nextUrl;
  console.log("[middleware] Pathname:", pathname);

  // Si déjà sur /fr ou /en, laisse passer (Clerk gère le reste)
  const match = pathname.match(/^\/(fr|en)(\/|$)/);
  if (match) {
    return NextResponse.next();
  }

  // Sinon, détecte la locale préférée et redirige
  const locale = getLocale(request);
  const redirectUrl = `/${locale}${pathname === "/" ? "" : pathname}`;
  console.log("[middleware] Redirection vers:", redirectUrl);
  return NextResponse.redirect(new URL(redirectUrl, request.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
