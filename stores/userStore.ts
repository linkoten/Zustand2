import { User } from "@/lib/generated/prisma";
import { create } from "zustand";

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: () => boolean;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  isAdmin: function () {
    return this.user?.role === "ADMIN";
  },
}));
