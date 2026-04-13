import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/generated/prisma";
import UserDashboard from "@/components/dashboard/userDashboard";
import AdminDashboard from "@/components/dashboard/adminDashboard";
import {
  getAdminDashboardData,
  getUserDashboardData,
  getOrSyncUser,
} from "@/lib/actions/dashboardActions";
import { getDictionary } from "../dictionaries";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/${lang}/sign-in`);
  }

  const user = await getOrSyncUser(userId);

  if (!user) {
    redirect(`/${lang}/sign-in`);
  }

  const dict = await getDictionary(lang);

  // Charger les données selon le rôle
  if (user.role === UserRole.ADMIN) {
    const adminData = await getAdminDashboardData();
    return (
      <div className="min-h-screen bg-silex relative overflow-hidden">
        {/* Décors administratifs */}
        <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none animate-float" />
        <AdminDashboard user={user} data={adminData} dict={dict} lang={lang} />
      </div>
    );
  } else {
    const userData = await getUserDashboardData(userId);
    return (
      <div className="min-h-screen bg-silex relative overflow-hidden">
        {/* Décors utilisateur */}
        <div className="absolute top-0 left-0 w-[50vh] h-[50vh] bg-terracotta/10 rounded-full blur-[120px] pointer-events-none animate-float" />
        <UserDashboard user={user} data={userData} lang={lang} dict={dict} />
      </div>
    );
  }
}
