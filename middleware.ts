import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["fr", "en"];

export default function middleware(request: NextRequest, event: any) {
  // Laisse Clerk gérer l'auth
  const clerkRes = clerkMiddleware()(request, event);
  if (clerkRes instanceof Promise) return clerkRes;

  const { pathname } = request.nextUrl;

  // Si déjà sur /fr ou /en, ne rien faire
  if (locales.some((loc) => pathname.startsWith(`/${loc}`))) {
    return clerkRes;
  }

  // Sinon, redirige selon la langue du navigateur (ou fr par défaut)
  const locale = request.headers.get("accept-language")?.startsWith("en")
    ? "en"
    : "fr";
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
