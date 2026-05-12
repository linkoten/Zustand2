"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { getUserData } from "./dashboardActions";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Non authentifié");
  const user = await getUserData(userId);
  if (!user || user.role !== UserRole.ADMIN) throw new Error("Accès non autorisé");
  return user;
}

export async function getNewsletterSubscribers(page = 1, search?: string) {
  try {
    await requireAdmin();

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [subscribers, total, active] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * 20,
        take: 20,
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    return {
      subscribers: subscribers.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
      total,
      active,
      totalPages: Math.ceil(total / 20),
    };
  } catch (error) {
    console.error("❌ getNewsletterSubscribers:", error);
    return { subscribers: [], total: 0, active: 0, totalPages: 0 };
  }
}

export async function subscribeToNewsletter(
  email: string,
  name?: string,
  lang = "fr",
) {
  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true, name: name ?? existing.name },
        });
        return { success: true, message: "Réinscription effectuée." };
      }
      return { success: false, message: "Cet email est déjà inscrit." };
    }

    await prisma.newsletterSubscriber.create({
      data: { email, name, lang, isActive: true },
    });

    return { success: true, message: "Inscription réussie !" };
  } catch (error) {
    console.error("❌ subscribeToNewsletter:", error);
    return { success: false, message: "Erreur lors de l'inscription." };
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false },
    });
    return { success: true };
  } catch (error) {
    console.error("❌ unsubscribeFromNewsletter:", error);
    return { success: false };
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  try {
    await requireAdmin();
    await prisma.newsletterSubscriber.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("❌ deleteNewsletterSubscriber:", error);
    return { success: false };
  }
}

export async function sendNewsletterToAll(subject: string, content: string) {
  try {
    await requireAdmin();

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, name: true, lang: true },
    });

    if (subscribers.length === 0) {
      return { success: false, message: "Aucun abonné actif." };
    }

    const { sendNewsletterEmail } = await import(
      "@/components/resend/sendNewsletterEmail"
    );

    const results = await Promise.allSettled(
      subscribers.map((sub) =>
        sendNewsletterEmail({
          to: sub.email,
          name: sub.name ?? undefined,
          subject,
          content,
          unsubscribeEmail: sub.email,
        }),
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`✅ Newsletter envoyée: ${sent} succès, ${failed} échecs`);
    return {
      success: true,
      message: `Newsletter envoyée à ${sent} abonnés.${failed > 0 ? ` (${failed} échecs)` : ""}`,
      sent,
      failed,
    };
  } catch (error) {
    console.error("❌ sendNewsletterToAll:", error);
    return { success: false, message: "Erreur lors de l'envoi." };
  }
}
