import { NotificationContext, NotificationContextType } from "@renderer/app/context/notificationContext";
import { useContext } from "react";

export const useAppNotification = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useAppNotification used outside NotificationProvider");
  return ctx;
};