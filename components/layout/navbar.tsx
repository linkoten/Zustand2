"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import {
  Menu,
  X,
  User,
  BookOpen,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { CartIconButton } from "../cart/cartIconButton";
import { NotificationButton } from "../notification/notificationButton";
import { getCartAction } from "@/lib/actions/cart-actions";
import { useCartStore } from "@/stores/cart-store";
import { LanguageSwitcher } from "./languageSwitcher";

type NavbarProps = {
  lang: "fr" | "en";
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
            stripeProductId: item.product.stripeProductId ?? null,
            stripePriceId: item.product.stripePriceId ?? null,
            product: {
              title: item.product.title,
              price: item.product.price,
              category: item.product.category,
            },
            imageUrl: item.product.images?.[0]?.imageUrl ?? null,
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
    {
      href: `/${lang}`,
      label: dict.navbar.home,
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      href: `/${lang}/fossiles`,
      label: dict.navbar.fossils,
      gradient: "from-amber-600 to-orange-600",
    },
    {
      href: `/${lang}/blog`,
      label: dict.navbar.blog,
      icon: BookOpen,
      gradient: "from-green-600 to-emerald-600",
    },
  ];

  const userLinks = [
    {
      href: `/${lang}/dashboard`,
      label: dict.navbar.dashboard,
      icon: LayoutDashboard,
      gradient: "from-purple-600 to-violet-600",
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
      {/* Navbar avec backdrop blur et design moderne */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo amélioré - Position plus à gauche */}
            <div className="flex-shrink-0 ">
              <Link
                href={`/${lang}`}
                className="flex items-center space-x-3 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-3 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-3xl tracking-tight bg-gradient-to-br from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm group-hover:from-amber-600 group-hover:via-orange-500 group-hover:to-red-500 transition-all duration-300">
                    Paleolitho
                  </span>
                  <span className="text-xs text-slate-500 font-medium -mt-1">
                    {lang === "en"
                      ? "Fossil Collection"
                      : "Collection de Fossiles"}
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation desktop avec design moderne - Centrée */}
            <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
              {/* Liens publics */}
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative group px-6 py-3 rounded-xl transition-all duration-300 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    {link.icon && (
                      <link.icon className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors duration-300" />
                    )}
                    <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                      {link.label}
                    </span>
                  </div>
                  <div
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${link.gradient} rounded-full group-hover:w-8 transition-all duration-300`}
                  ></div>
                </Link>
              ))}

              {/* Liens pour utilisateurs connectés */}
              {isLoaded && user && (
                <>
                  {userLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="relative group px-6 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50"
                    >
                      <div className="flex items-center gap-3">
                        {link.icon && (
                          <link.icon className="w-4 h-4 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                        )}
                        <span className="font-semibold text-purple-700 group-hover:text-purple-800 transition-colors duration-300">
                          {link.label}
                        </span>
                      </div>
                      <div
                        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${link.gradient} rounded-full group-hover:w-8 transition-all duration-300`}
                      ></div>
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Actions desktop avec design amélioré - Position plus à droite */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0 ">
              {isLoaded && user && (
                <div className="relative">
                  <NotificationButton userId={user.id} dict={dict} />
                </div>
              )}

              <div className="relative">
                <CartIconButton onClick={toggleCart} />
              </div>

              {isLoaded && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <UserButton
                          afterSignOutUrl="/"
                          appearance={{
                            elements: {
                              avatarBox:
                                "w-10 h-10 ring-2 ring-white shadow-lg hover:ring-blue-200 transition-all duration-300",
                            },
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                      <Button
                        asChild
                        variant="ghost"
                        className="hover:bg-slate-100 rounded-xl px-4 py-2 transition-all duration-300 group"
                      >
                        <Link href={`/${lang}/sign-in`}>
                          <User className="mr-2 h-4 w-4 group-hover:text-blue-600 transition-colors duration-300" />
                          <span className="font-semibold group-hover:text-blue-600 transition-colors duration-300">
                            {dict.navbar.signin}
                          </span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        <Link href={`/${lang}/sign-up`}>
                          {dict.navbar.signup}
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              )}

              <div className="pl-4 border-l border-slate-200">
                <LanguageSwitcher lang={lang} />
              </div>
            </div>

            {/* Menu mobile amélioré */}
            <div className="lg:hidden flex items-center space-x-3">
              {isLoaded && user && (
                <NotificationButton userId={user.id} dict={dict} />
              )}
              <CartIconButton onClick={toggleCart} />
              <LanguageSwitcher lang={lang} />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="relative group rounded-xl p-2 hover:bg-slate-100 transition-all duration-300"
                aria-label="Menu"
              >
                <div className="relative">
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-slate-700 group-hover:text-slate-900 transition-colors duration-300" />
                  ) : (
                    <Menu className="h-6 w-6 text-slate-700 group-hover:text-slate-900 transition-colors duration-300" />
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* Navigation mobile avec design moderne */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-6 border-t border-slate-200/50 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col space-y-2">
                {/* Liens publics */}
                {navigationLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-4 px-4 py-4 rounded-xl mx-2 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300 transform hover:translate-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {link.icon && (
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${link.gradient} shadow-lg`}
                      >
                        <link.icon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                      {link.label}
                    </span>
                  </Link>
                ))}

                {/* Liens pour utilisateurs connectés en mobile */}
                {isLoaded && user && (
                  <div className="border-t border-slate-200/50 pt-4 mt-4">
                    {userLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center gap-4 px-4 py-4 rounded-xl mx-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300 transform hover:translate-x-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          animationDelay: `${(navigationLinks.length + index) * 100}ms`,
                        }}
                      >
                        {link.icon && (
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${link.gradient} shadow-lg`}
                          >
                            <link.icon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="font-semibold text-purple-700 group-hover:text-purple-800 transition-colors duration-300">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Section authentification mobile */}
                <div className="border-t border-slate-200/50 pt-6 mt-6 px-4">
                  {isLoaded && (
                    <>
                      {user ? (
                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                          <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                              elements: {
                                avatarBox:
                                  "w-12 h-12 ring-2 ring-white shadow-lg",
                              },
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-slate-600">
                              {user.emailAddresses[0]?.emailAddress}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start h-12 rounded-xl hover:bg-slate-100 group"
                          >
                            <Link
                              href={`/${lang}/sign-in`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <User className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors duration-300" />
                              <span className="font-semibold group-hover:text-blue-600 transition-colors duration-300">
                                {dict.navbar.signin}
                              </span>
                            </Link>
                          </Button>
                          <Button
                            asChild
                            className="w-full h-12 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            <Link
                              href={`/${lang}/sign-up`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {dict.navbar.signup}
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
