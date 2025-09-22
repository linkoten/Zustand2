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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <AdminDashboard user={user} data={adminData} dict={dict} lang={lang} />
      </div>
    );
  } else {
    const userData = await getUserDashboardData(userId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20">
        <UserDashboard user={user} data={userData} lang={lang} dict={dict} />
      </div>
    );
  }
}
