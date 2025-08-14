"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, ShoppingBag, ShoppingCart } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      href: "/",
      label: "Accueil",
      icon: Home,
    },
    {
      href: "/fossiles",
      label: "Fossiles",
      icon: ShoppingBag,
    },
  ];

  const authenticatedItems = [
    {
      href: "/panier",
      label: "Panier",
      icon: ShoppingCart,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64">
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-2 font-bold text-lg mb-4">
            <ShoppingBag className="w-6 h-6 text-primary" />
            FossilShop
          </div>

          {/* Navigation principale */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Navigation pour utilisateurs connectés */}
            <SignedIn>
              {authenticatedItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </SignedIn>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
