import { NotificationContext, NotificationContextType } from "@renderer/app/context/notificationContext";
import { use } from "react";

export const useAppNotification = (): NotificationContextType => {
  const ctx = use(NotificationContext);
  if (!ctx) throw new Error("useAppNotification used outside NotificationProvider");
  return ctx;
};