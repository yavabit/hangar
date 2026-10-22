import type { FC, ReactNode } from "react";
import { notification } from "antd";
import { CircleCheck, CircleX, Info, LoaderCircle } from "lucide-react";
import { NotificationContext, type NotificationOptions } from "../context/notificationContext";

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  /**
   * Notification индикатор загрузки
   * @param key 
   * @param options 
   */
  const showLoading = (key: string, options: NotificationOptions): void => {
    api.open({
      key,
      title: options.message ?? "Загрузка...",
      description: options.description ?? "Пожалуйста, подождите",
      duration: 0,
      icon: <LoaderCircle size={20} className="spin" style={{ color: "var(--accent)" }} />,
    });
  };

  /**
   * Notification индикатор успешного выполнения
   * @param key 
   * @param options 
   */
  const showSuccess = (key: string, options: NotificationOptions): void => {
    api.open({
      key,
      title: options.message ?? "Готово!",
      description: options.description,
      duration: options.duration ?? 3,
      showProgress: true,
      icon: <CircleCheck size={20} style={{ color: "var(--success)" }} />,
    });
  };

  /**
   * Notification индикатор ошибки
   * @param key 
   * @param options 
   */
  const showError = (key: string, options: NotificationOptions): void => {
    api.open({
      key,
      title: options.message ?? "Произошла ошибка!",
      description: options.description,
      duration: options.duration ?? 3,
      showProgress: true,
      icon: <CircleX size={20} style={{ color: "var(--danger)" }} />,
    });
  };

  /**
   * Notification индикатор информации
   * @param key 
   * @param options 
   */
  const showInfo = (key: string, options: NotificationOptions): void => {
    api.open({
      key,
      title: options.message,
      description: options.description,
      actions: options.actions,
      duration: options.duration ?? 3,
      showProgress: true,
      icon: <Info size={20} style={{ color: "var(--accent)" }} />,
    });
  };

  return (
    <NotificationContext
      value={{
        showLoading,
        showSuccess,
        showError,
        showInfo,
      }}
    >
      {contextHolder}
      {children}
    </NotificationContext>
  );
};
