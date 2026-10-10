import { ipcMain } from "electron";

import { ProjectsStorage } from "../storage/projects.storage";
import { SettingsStorage } from "../storage/settings.storage";
import { Project } from "../../shared/schemas/store.schema";
import { ProjectService } from "../services/projects.service";

export function registerProjectsIpc(): void {
	ipcMain.handle("projects:getAll", () => {
		return ProjectsStorage.getAll();
	});

	ipcMain.handle("projects:add", (event, project: Omit<Project, "id">) => {
		const newProject = ProjectsStorage.add({
			...project,
			isFavorite: project.isFavorite ?? false,
			lastOpened: project.lastOpened || new Date().toISOString(),
		});

		void ProjectService.refreshProjectLastOpened(newProject.id).then((projects) => {
			if (projects && !event.sender.isDestroyed()) {
				event.sender.send("app:lastOpenedUpdated", projects);
			}
		});

		return newProject;
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

	ipcMain.handle("projects:inspectPath", async (_, projectPath: string) => {
		return ProjectService.inspectPath(projectPath);
	});

	ipcMain.handle("projects:openInIde", async (_, projectPath: string) => {
		const { common } = SettingsStorage.get();
		return ProjectService.openInIde(projectPath, common.defaultIDE);
	});
}
