import { ipcMain } from "electron";
import { store } from "../storage/store";
import { ProjectService } from "../services/projects.service";

export function registerAppIpc(): void {
	ipcMain.handle("app:get", async () => {
		await ProjectService.refreshLastOpenedTimestamps();
		return store.store;
	});
}
