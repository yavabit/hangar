import { ipcMain } from "electron";
import { ProjectsStorage } from "../storage/projects.storage";
import { FoldersStorage } from "../storage/folders.storage";
import { SettingsStorage } from "../storage/settings.storage";
import { StatusService } from "../services/status.service";
import { getMainWindow } from "../window";
import type { AppState } from "../../shared/api/api.types";

export function registerAppIpc(): void {
	ipcMain.handle("app:get", (): AppState => {
		return {
			settings: SettingsStorage.get(),
			projects: ProjectsStorage.getAll(),
			folders: FoldersStorage.getAll(),
			health: StatusService.getHealth(),
		};
	});

	ipcMain.handle("app:hide", () => {
		getMainWindow()?.hide();
	});
}
