"use client";
import { User } from "@/lib/generated/prisma";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

export default function UserProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <>{children}</>;
}
