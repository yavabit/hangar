import { useEffect, useRef } from "react";
import { Button } from "antd";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "@renderer/shared/hooks/useAppNotification";

/**
 * Сообщает о новой версии, которая ждёт действия: скачанной — перезапуска, найденной без автоскачивания — загрузки.
 * На странице настроек не показывается: там статус и так виден. Когда окно не в фокусе, main показывает системное уведомление
 */
export const useUpdateNotice = (): void => {
	const update = useAppStore((s) => s.update);
	const autoDownload = useAppStore((s) => s.settings.updates.autoDownload);
	const { pathname } = useLocation();
	const { showInfo } = useAppNotification();
	const shownRef = useRef<string | null>(null);

	useEffect(() => {
		const waitsForUser =
			update.state === "ready" || (update.state === "available" && !(update.canInstall && autoDownload));
		if (!waitsForUser || !("version" in update)) {
			return;
		}

		const key = `${update.state}:${update.version}`;
		if (shownRef.current === key) {
			return;
		}
		shownRef.current = key;

		if (pathname === "/settings") {
			return;
		}

		const action =
			update.state === "ready" ? (
				<Button type="primary" size="small" onClick={() => void window.api.updates.install()}>
					Перезапустить
				</Button>
			) : update.canInstall ? (
				<Button type="primary" size="small" onClick={() => void window.api.updates.download()}>
					Скачать
				</Button>
			) : (
				<Button type="primary" size="small" href={update.releaseUrl} target="_blank">
					Страница загрузки
				</Button>
			);

		showInfo("update", {
			message: update.state === "ready" ? `Hangar ${update.version} готов к установке` : `Вышла версия Hangar ${update.version}`,
			description:
				update.state === "ready"
					? "Перезапустите приложение сейчас или обновление установится при выходе"
					: "Подробности и настройки обновлений — в настройках",
			actions: action,
			duration: 0,
		});
	}, [update, autoDownload, pathname, showInfo]);
};
