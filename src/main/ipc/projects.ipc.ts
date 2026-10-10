import { ipcMain } from "electron";

import { ProjectsStorage } from "../storage/projects.storage";
import { SettingsStorage } from "../storage/settings.storage";
import { Project } from "../../shared/schemas/store.schema";
import { ProjectService } from "../services/projects.service";

export function registerProjectsIpc(): void {
	ipcMain.handle("projects:getAll", () => {
		return ProjectsStorage.getAll();
	});

	ipcMain.handle("projects:add", (_, project) => {
		return ProjectsStorage.add(project);
	});

	ipcMain.handle("projects:update", (_, id: Project["id"], patch: Partial<Project>) => {
		return ProjectsStorage.update(id, patch);
	});

	ipcMain.handle("projects:remove", (_, id: string) => {
		ProjectsStorage.remove(id);
	});

	ipcMain.handle("projects:openFolder", async (_, projectPath: string) => {
		return ProjectService.openFolder(projectPath);
	});

	ipcMain.handle("projects:openInIde", async (_, projectPath: string) => {
		const { common } = SettingsStorage.get();
		return ProjectService.openInIde(projectPath, common.defaultIDE);
	});
}
