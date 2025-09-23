"use client";
import { Bell, Check, ExternalLink, X, Trash2, Archive } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "@/lib/actions/notificationAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
// ✅ Import corrigé
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { fr, enUS } from "date-fns/locale";

export function NotificationButton({
  userId,
  dict,
  lang = "fr",
}: {
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  lang?: "en" | "fr";
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
            link: n.link ?? undefined,
          }))
        )
      );
    }
  }, [userId, setNotifications]);

  // Nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    for (const notif of unreadNotifications) {
      await markNotificationAsRead(notif.id);
      markAsRead(notif.id);
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = lang === "fr" ? fr : enUS;

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale,
    });
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "ORDER":
        return "🛒";
      case "PAYMENT":
        return "💳";
      case "SHIPPING":
        return "📦";
      case "SYSTEM":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  const NotificationItem = ({
    notif,
    isCompact = false,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notif: any;
    isCompact?: boolean;
  }) => (
    <div
      className={`group relative p-3 sm:p-4 transition-all duration-200 hover:bg-slate-50 ${
        !notif.isRead
          ? "bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-l-4 border-amber-400"
          : "bg-white"
      }`}
    >
      {/* Badge non-lu */}
      {!notif.isRead && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Icône type */}
        <div
          className={`flex-shrink-0 ${isCompact ? "text-lg" : "text-xl"} mt-0.5`}
        >
          {getNotificationIcon(notif.type)}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`font-semibold text-slate-900 line-clamp-1 ${
                isCompact ? "text-sm" : "text-base"
              }`}
            >
              {notif.title}
            </h4>
            {!notif.isRead && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 flex-shrink-0"
              >
                {dict?.notification?.new || "Nouveau"}
              </Badge>
            )}
          </div>

          <p
            className={`text-slate-600 line-clamp-2 mb-2 ${
              isCompact ? "text-xs" : "text-sm"
            }`}
          >
            {notif.message}
          </p>

          <div className="flex items-center justify-between">
            <span
              className={`text-slate-400 ${isCompact ? "text-xs" : "text-sm"}`}
            >
              {formatNotificationDate(notif.createdAt)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {!notif.isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}

              {notif.link && (
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-700"
                  onClick={() => setOpen(false)}
                >
                  <Link href={notif.link}>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationContent = ({
    isMobile = false,
  }: {
    isMobile?: boolean;
  }) => (
    // ✅ CORRECTION PRINCIPALE : Largeur adaptative pour desktop
    <div
      className={`${isMobile ? "w-full" : "w-80 sm:w-96 lg:w-[420px] xl:w-[480px]"}`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {dict?.notification?.title || "Notifications"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} ${dict?.notification?.unread || "non lues"}`
                  : dict?.notification?.allRead || "Tout lu"}
              </p>
            </div>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="text-xs hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
              >
                <Check className="w-3 h-3 mr-1" />
                <span className="hidden lg:inline">
                  {dict?.notification?.markAllAsRead || "Tout marquer"}
                </span>
                <span className="lg:hidden">✓</span>
              </Button>
            )}

            {!isMobile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="hover:bg-red-50 hover:text-red-700 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div
        className={`${isMobile ? "max-h-[60vh]" : "max-h-96"} overflow-hidden`}
      >
        <ScrollArea className="h-full">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">
                {dict?.notification?.empty || "Aucune notification"}
              </h4>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                {dict?.notification?.emptyDescription ||
                  "Vous recevrez ici toutes vos notifications importantes"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  isCompact={isMobile}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-200 p-3 sm:p-4 bg-slate-50">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-center text-sm font-medium hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            <Link href={`/${lang}/notifications`}>
              {dict?.notification?.viewAll || "Voir toutes les notifications"}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Desktop - Popover */}
      {!isMobile ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-100 transition-colors duration-200"
              aria-label={dict?.notification?.ariaLabel || "Notifications"}
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs flex items-center justify-center p-0 animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 border-0 shadow-2xl bg-white rounded-xl overflow-hidden"
            align="end"
            sideOffset={8}
            // ✅ CORRECTION : Ajout de avoidCollisions et collisionPadding
            avoidCollisions={true}
            collisionPadding={20}
            // ✅ CORRECTION : Force la largeur minimale
            style={{ minWidth: "320px" }}
          >
            <NotificationContent />
          </PopoverContent>
        </Popover>
      ) : (
        /* Mobile - Sheet */
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-100 transition-colors duration-200"
              aria-label={dict?.notification?.ariaLabel || "Notifications"}
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs flex items-center justify-center p-0 animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-full sm:w-96 bg-white">
            <NotificationContent isMobile />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
