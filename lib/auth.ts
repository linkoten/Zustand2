import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // ✅ Récupérer l'utilisateur en base de données pour vérifier son rôle
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, id: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // ✅ Vérifier que l'utilisateur est bien admin
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard"); // Rediriger vers le dashboard utilisateur
  }

  return user;
}

// Fonction utilitaire pour vérifier si un utilisateur est admin sans redirection
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    const { userId: clerkUserId } = await auth();
    const userIdToCheck = userId || clerkUserId;

    if (!userIdToCheck) return false;

    const user = await prisma.user.findUnique({
      where: { clerkId: userIdToCheck },
      select: { role: true },
    });

    return user?.role === UserRole.ADMIN;
  } catch {
    return false;
  }
}
