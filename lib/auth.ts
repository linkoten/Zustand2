import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    redirect("/fossiles");
  }

  return { userId, user };
}

export async function isUserAdmin() {
  const { userId } = await auth();

  if (!userId) return false;

  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}
