import { ipcMain } from "electron";
import { ProjectsStorage } from "../storage/projects.storage";
import { FoldersStorage } from "../storage/folders.storage";
import { SettingsStorage } from "../storage/settings.storage";
import { StatusService } from "../services/status.service";
import { getWindowInfo, sendToMainWindow, showMainWindow } from "../window";
import { hidePalette, showPalette } from "../palette";
import type { AppState } from "../../shared/api/api.types";

export function registerAppIpc(): void {
	ipcMain.handle("app:get", (): AppState => {
		return {
			settings: SettingsStorage.get(),
			projects: ProjectsStorage.getAll(),
			folders: FoldersStorage.getAll(),
			health: StatusService.getHealth(),
			checkedAt: StatusService.getCheckedAt(),
			window: getWindowInfo(),
		};
	});

	ipcMain.handle("app:showPalette", () => {
		showPalette();
	});

	ipcMain.handle("app:hidePalette", () => {
		hidePalette();
	});

	ipcMain.handle("app:openInMain", (_, route: string) => {
		hidePalette();
		showMainWindow();
		sendToMainWindow("app:navigate", route);
	});
}
