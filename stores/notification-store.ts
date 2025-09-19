import { create } from "zustand";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notif: Notification) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  setNotifications: (notifs: Notification[]) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  setNotifications: (notifs) => set({ notifications: notifs }),
}));
