"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Menu, X, User, BookOpen, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { CartIconButton } from "../cart/cartIconButton";
import { NotificationButton } from "../notification/notificationButton";
import { getCartAction } from "@/lib/actions/cart-actions";
import { useCartStore } from "@/stores/cart-store";
import { LanguageSwitcher } from "./languageSwitcher";

type NavbarProps = {
  lang: "fr" | "en"; // ✅ Changer de "fr-FR" | "en-US" vers "fr" | "en"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
};

export default function Navbar({ lang, dict }: NavbarProps) {
  useEffect(() => {
    async function syncCart() {
      const cart = await getCartAction();
      if (cart && cart.items) {
        useCartStore.setState({
          items: cart.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
            category: item.product.category,
            stripeProductId: item.product.stripeProductId ?? null, // 👈 force null si undefined
            stripePriceId: item.product.stripePriceId ?? null, // 👈 force null si undefined
            product: {
              title: item.product.title,
              price: item.product.price,
              category: item.product.category,
            },
            imageUrl: item.product.images?.[0]?.imageUrl ?? null, // 👈 force null si undefined
          })),
          totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: cart.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          ),
        });
      }
    }
    syncCart();
  }, []);
  const { user, isLoaded } = useUser();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { href: `/${lang}`, label: dict.navbar.home },
    { href: `/${lang}/fossiles`, label: dict.navbar.fossils },
    { href: `/${lang}/blog`, label: dict.navbar.blog, icon: BookOpen },
  ];

  const userLinks = [
    {
      href: `/${lang}/dashboard`,
      label: dict.navbar.dashboard,
      icon: LayoutDashboard,
    },
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
            <Link href={`/${lang}`} className="flex items-center space-x-2">
              <span
                className="font-extrabold text-2xl tracking-tight bg-gradient-to-br from-amber-600 via-amber-400 to-yellow-400 bg-clip-text text-transparent drop-shadow"
                style={{
                  letterSpacing: "0.04em",
                  textShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                Paleolitho
              </span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Liens publics */}
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

              {/* ✅ Liens pour utilisateurs connectés */}
              {isLoaded && user && (
                <>
                  {userLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-700 hover:text-gray-900 transition-colors font-medium flex items-center gap-2"
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Actions desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoaded && user && (
                <NotificationButton userId={user.id} dict={dict} />
              )}
              <CartIconButton onClick={toggleCart} />
              {isLoaded && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button asChild variant="ghost">
                        <Link href={`/${lang}/sign-in`}>
                          <User className="mr-2 h-4 w-4" />
                          {dict.navbar.signin}
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/${lang}/sign-up`}>
                          {dict.navbar.signup}
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
              <LanguageSwitcher lang={lang} />
            </div>

            {/* Menu mobile button */}
            <div className="md:hidden flex items-center space-x-2">
              {isLoaded && user && (
                <NotificationButton userId={user.id} dict={dict} />
              )}
              <CartIconButton onClick={toggleCart} />
              <LanguageSwitcher lang={lang} />

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
                {/* Liens publics */}
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

                {/* ✅ Liens pour utilisateurs connectés en mobile */}
                {isLoaded && user && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      {userLinks.map((link) => (
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
                    </div>
                  </>
                )}

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
                              href={`/${lang}/sign-in`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Connexion
                            </Link>
                          </Button>
                          <Button asChild className="justify-start">
                            <Link
                              href={`/${lang}/sign-up`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              S&apos;inscrire
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
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        dict={dict}
      />
    </>
  );
}
