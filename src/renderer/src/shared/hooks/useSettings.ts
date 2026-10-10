import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "./useAppNotification";
import { settingsApi } from "../api/settings.api";
import { AppSettings } from "@schemas/store.schema";

type SettingsType = {
	settings: AppSettings
	updateSettings: (patch: Partial<AppSettings>) => void
}

export const useSettings = (): SettingsType => {
	const settings = useAppStore((s) => s.settings);
	const setSettings = useAppStore((s) => s.setSettings);

	const { showSuccess, showError } = useAppNotification();

	const updateSettings = async (patch): Promise<void> => {
		const next = {
			...settings,
			...patch,
			common: {
				...settings.common,
				...patch.common,
			},
			git: {
				...settings.git,
				...patch.git,
			},
		};

		setSettings(next);

		try {
			await settingsApi.set(next);

			showSuccess("settings_save", {
				message: "Настройки сохранены",
			});
		} catch (e) {
			showError("settings_save", {
				message: "Ошибка сохранения",
			});

			throw e;
		}
	};

	return {
		settings,
		updateSettings,
	};
};
