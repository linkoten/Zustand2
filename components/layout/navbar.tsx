"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { ShoppingCart, Menu, X, User, BookOpen } from "lucide-react";
import { useState } from "react";
import { CartSidebar } from "@/components/cart/cart-sidebar";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { href: "/", label: "Accueil" },
    { href: "/fossiles", label: "Fossiles" },
    { href: "/blog", label: "Blog", icon: BookOpen }, // ✅ Nouveau lien blog
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">🦕</div>
              <span className="font-bold text-xl">FossilShop</span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium flex items-center gap-2"
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>

              {isLoaded && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button asChild variant="ghost">
                        <Link href="/sign-in">
                          <User className="mr-2 h-4 w-4" />
                          Connexion
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/sign-up">S'inscrire</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Menu mobile button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-gray-900 transition-colors font-medium flex items-center gap-2 px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                ))}

                <div className="border-t pt-4 mt-4">
                  {isLoaded && (
                    <>
                      {user ? (
                        <div className="flex items-center space-x-2 px-2">
                          <UserButton afterSignOutUrl="/" />
                          <span className="text-sm text-gray-600">
                            {user.emailAddresses[0]?.emailAddress}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2 px-2">
                          <Button
                            asChild
                            variant="ghost"
                            className="justify-start"
                          >
                            <Link
                              href="/sign-in"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Connexion
                            </Link>
                          </Button>
                          <Button asChild className="justify-start">
                            <Link
                              href="/sign-up"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              S'inscrire
                            </Link>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar du panier */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
