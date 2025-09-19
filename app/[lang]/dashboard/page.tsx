import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/generated/prisma";
import UserDashboard from "@/components/dashboard/userDashboard";
import AdminDashboard from "@/components/dashboard/adminDashboard";
import {
  getAdminDashboardData,
  getUserDashboardData,
  getUserData,
} from "@/lib/actions/dashboardActions";
import { getDictionary } from "../dictionaries";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const { lang } = await params;

  const dict = await getDictionary(lang);

  // Charger les données selon le rôle
  if (user.role === UserRole.ADMIN) {
    const adminData = await getAdminDashboardData();
    return <AdminDashboard user={user} data={adminData} />;
  } else {
    const userData = await getUserDashboardData(userId);
    return (
      <UserDashboard user={user} data={userData} lang={lang} dict={dict} />
    );
  }
}
