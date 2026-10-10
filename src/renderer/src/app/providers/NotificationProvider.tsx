import type { FC, ReactNode } from "react";
import { notification } from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
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
      icon: <LoadingOutlined spin style={{ color: "#1677ff" }} />,
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
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
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
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
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
      duration: options.duration ?? 3,
      showProgress: true,
      icon: <InfoCircleOutlined style={{ color: "#1677ff" }} />,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        showLoading,
        showSuccess,
        showError,
        showInfo,
      }}
    >
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};
