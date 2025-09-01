"use client";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

export default function UserProvider({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <>{children}</>;
}
