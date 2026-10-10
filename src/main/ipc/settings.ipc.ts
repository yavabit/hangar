import { ipcMain } from "electron";

import { SettingsStorage } from "../storage/settings.storage";

export function registerSettingsIpc(): void {
	ipcMain.handle("settings:get", () => {
		return SettingsStorage.get();
	});

	ipcMain.handle("settings:set", (_, settings) => {
		SettingsStorage.set(settings);

		return {
			success: true,
		};
	});
}
