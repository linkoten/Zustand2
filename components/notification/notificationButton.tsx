"use client";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "@/lib/actions/notificationAction";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NotificationButton({
  userId,
  dict,
}: {
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}) {
  const [open, setOpen] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  // Charger les notifications au montage
  useEffect(() => {
    if (userId) {
      getUserNotifications(userId).then((notifs) =>
        setNotifications(
          notifs.map((n) => ({
            ...n,
            createdAt:
              typeof n.createdAt === "string"
                ? n.createdAt
                : n.createdAt.toISOString(),
            readAt: n.readAt
              ? typeof n.readAt === "string"
                ? n.readAt
                : n.readAt.toISOString()
              : undefined,
            link: n.link ?? undefined, // 👈 Corrige ici
          }))
        )
      );
    }
  }, [userId, setNotifications]);

  // Nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    markAsRead(id);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.notification.ariaLabel}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-amber-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b font-semibold">
            {dict.notification.title}
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              {dict.notification.empty}
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-b last:border-0 ${notif.isRead ? "bg-gray-50" : "bg-amber-50"}`}
              >
                <div className="font-medium">{notif.title}</div>
                <div className="text-sm text-gray-600">{notif.message}</div>
                <div className="flex items-center gap-2 mt-2">
                  {!notif.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      {dict.notification.markAsRead}
                    </Button>
                  )}
                  {notif.link && (
                    <Button asChild size="sm" variant="link">
                      <Link href={notif.link}>{dict.notification.see}</Link>
                    </Button>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString(
                    dict.notification.dateLocale || "fr-FR"
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
