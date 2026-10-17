import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "./useAppNotification";
import { settingsApi } from "../api/settings.api";
import { getIpcErrorMessage } from "../utils/ipcError";
import type { AppSettings } from "@schemas/store.schema";

type SettingsType = {
	settings: AppSettings;
	/** Возвращает true, если настройки сохранены */
	updateSettings: (input: AppSettings) => Promise<boolean>;
};

export const useSettings = (): SettingsType => {
	const settings = useAppStore((s) => s.settings);
	const setSettings = useAppStore((s) => s.setSettings);

	const { showSuccess, showError, showInfo } = useAppNotification();

	const updateSettings = async (input: AppSettings): Promise<boolean> => {
		try {
			const result = await settingsApi.set(input);
			setSettings(result.settings);

			showSuccess("settings_save", {
				message: "Настройки сохранены",
			});

			if (result.warnings.length) {
				showInfo("settings_warnings", {
					message: "Обратите внимание",
					description: result.warnings.join("\n"),
					duration: 8,
				});
			}

			return true;
		} catch (e) {
			showError("settings_save", {
				message: "Ошибка сохранения",
				description: getIpcErrorMessage(e),
			});

			return false;
		}
	};

	return {
		settings,
		updateSettings,
	};
};
