import { ipcMain } from "electron";

import { SettingsStorage } from "../storage/settings.storage";
import { applyGlobalHotkey } from "../hotkey";
import { StatusService } from "../services/status.service";
import { getMainWindow } from "../window";
import type { AppSettings } from "../../shared/schemas/store.schema";
import type { SaveSettingsResult } from "../../shared/api/api.types";

export function registerSettingsIpc(): void {
	ipcMain.handle("settings:get", () => {
		return SettingsStorage.get();
	});

	ipcMain.handle("settings:set", (_, input: AppSettings): SaveSettingsResult => {
		const settings = SettingsStorage.save(input);

		const warnings: string[] = [];
		const hotkeyWarning = applyGlobalHotkey(settings.common.globalHotkey);
		if (hotkeyWarning) {
			warnings.push(hotkeyWarning);
		}

		StatusService.applySchedule(() => !!getMainWindow()?.isVisible());
		void StatusService.refresh("existence");

		return { settings, warnings };
	});
}
