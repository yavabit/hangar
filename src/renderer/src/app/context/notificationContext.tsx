import { createContext } from "react";

/**
 * Параметры notification уведомлений
 * @interface NotificationOptions
 */
export interface NotificationOptions {
	/**
	 * Заголовок уведомления
   */
	message?: React.ReactNode;
	/**
	 * Дополнительное описание/детали уведомления
   */
	description?: React.ReactNode;
	/**
	 * Продолжительность показа уведомления в секундах. По умолчанию - 3s
   */
	duration?: number;
	/**
	 * Кнопки под текстом уведомления
	 */
	actions?: React.ReactNode;
}

export interface NotificationContextType {
	showLoading: (key: string, options: NotificationOptions) => void;
	showSuccess: (key: string, options: NotificationOptions) => void;
	showError: (key: string, options: NotificationOptions) => void;
	showInfo: (key: string, options: NotificationOptions) => void;
}

export const NotificationContext =
	createContext<NotificationContextType | null>(null);