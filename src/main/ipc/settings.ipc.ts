import { ipcMain, nativeTheme } from "electron";

import { SettingsStorage } from "../storage/settings.storage";
import { applyGlobalHotkey } from "../hotkey";
import { StatusService } from "../services/status.service";
import { UpdateService } from "../services/update.service";
import { applyAutostart } from "../autostart";
import { getMainWindow } from "../window";
import type { AppSettings } from "../../shared/schemas/store.schema";
import type { SaveSettingsResult } from "../../shared/api/api.types";

export function registerSettingsIpc(): void {
	ipcMain.handle("settings:get", () => {
		return SettingsStorage.get();
	});

	ipcMain.handle("settings:set", (_, input: AppSettings): SaveSettingsResult => {
		const prev = SettingsStorage.get();
		const settings = SettingsStorage.save(input);

		const warnings: string[] = [];
		const hotkeyWarning = applyGlobalHotkey(settings.common.globalHotkey);
		if (hotkeyWarning) {
			warnings.push(hotkeyWarning);
		}

		nativeTheme.themeSource = settings.appearance.theme;
		if (prev.startup.openAtLogin !== settings.startup.openAtLogin) {
			try {
				applyAutostart(settings.startup, true);
			} catch (error) {
				warnings.push(`Не удалось изменить автозапуск: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		UpdateService.applySettings();
		StatusService.applySchedule(() => !!getMainWindow()?.isVisible());
		void StatusService.refresh("existence");

		return { settings, warnings };
	});
}
