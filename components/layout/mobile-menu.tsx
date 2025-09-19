"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Settings,
  Package,
  LayoutDashboard,
  FileText,
  Users,
} from "lucide-react";

export function AdminMenu({ lang }: { lang: "fr" | "en" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Admin</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* ✅ Lien Dashboard */}
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/dashboard`}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Gestion des produits */}
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/fossiles/create`}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un produit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/admin/products`}>
            <Package className="w-4 h-4 mr-2" />
            Gérer les produits
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ✅ Nouvelles sections admin */}
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/admin/fossil-requests`}>
            <FileText className="w-4 h-4 mr-2" />
            Demandes de fossiles
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/admin/users`}>
            <Users className="w-4 h-4 mr-2" />
            Gestion utilisateurs
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ✅ Nouveau composant pour le menu utilisateur normal
export function UserMenu({ lang }: { lang: "fr" | "en" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Mon compte</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/dashboard`}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Tableau de bord
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/profile`}>
            <Users className="w-4 h-4 mr-2" />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/orders`}>
            <Package className="w-4 h-4 mr-2" />
            Mes commandes
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
