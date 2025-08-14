"use client";

import Link from "next/link";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedOut,
  SignedIn,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Home, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { CartSidebar } from "../cart/cart-sidebar";

export function Navbar() {
  const { totalItems, openCart } = useCartStore();

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between p-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <span className="hidden sm:inline">FossilShop</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>

            <Link
              href="/fossiles"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Fossiles
            </Link>
          </nav>

          {/* Authentification + Panier */}
          <div className="flex items-center gap-4">
            {/* Bouton Panier */}
            <SignedIn>
              <Button
                variant="ghost"
                size="sm"
                onClick={openCart}
                className="relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {totalItems}
                  </Badge>
                )}
                <span className="sr-only">Ouvrir le panier</span>
              </Button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Se connecter
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">S&apos;inscrire</Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Sidebar du panier */}
      <CartSidebar />
    </>
  );
}
