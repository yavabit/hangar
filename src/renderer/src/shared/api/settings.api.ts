import type { ElectronApi } from "@common/api/api.types";

type SettingsApi = ElectronApi["settings"];

export const settingsApi: SettingsApi = {
	get: () => window.api.settings.get(),

	set: (settings) => window.api.settings.set(settings),
};
