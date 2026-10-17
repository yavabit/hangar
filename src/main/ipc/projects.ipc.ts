import { ipcMain } from "electron";

import { ProjectsStorage } from "../storage/projects.storage";
import { Project } from "../../shared/schemas/store.schema";
import type { NewProject } from "../../shared/api/api.types";
import { ProjectService } from "../services/projects.service";
import { StatusService } from "../services/status.service";

const withDefaults = (project: NewProject): Omit<Project, "id"> => ({
	...project,
	isFavorite: project.isFavorite ?? false,
	lastModified: project.lastModified || new Date().toISOString(),
});

/** Реальная дата изменения и состояние папки считаются в фоне, чтобы не держать UI */
const inspectInBackground = (projects: Project[]): void => {
	void (async () => {
		for (const project of projects) {
			await ProjectService.refreshProjectLastModified(project.id);
			await StatusService.refreshProject(project.id);
		}
	})();
};

export function registerProjectsIpc(): void {
	ipcMain.handle("projects:getAll", () => {
		return ProjectsStorage.getAll();
	});

	ipcMain.handle("projects:add", (_, project: NewProject) => {
		const created = ProjectsStorage.add(withDefaults(project));
		inspectInBackground([created]);
		return created;
	});

	ipcMain.handle("projects:addMany", (_, projects: NewProject[]) => {
		const created = ProjectsStorage.addMany(projects.map(withDefaults));
		inspectInBackground(created);
		return created;
	});

	ipcMain.handle("projects:update", (_, id: Project["id"], patch: Partial<Project>) => {
		const prev = ProjectsStorage.getById(id);
		const updated = ProjectsStorage.update(id, patch);

		if (prev && patch.path !== undefined && patch.path !== prev.path) {
			inspectInBackground([updated]);
		}

		return updated;
	});

	ipcMain.handle("projects:remove", (_, id: string) => {
		ProjectsStorage.remove(id);
	});

	ipcMain.handle("projects:openFolder", (_, id: Project["id"]) => {
		return ProjectService.openProjectFolder(id);
	});

	ipcMain.handle("projects:openInIde", async (_, id: Project["id"]) => {
		const project = await ProjectService.openProjectInIde(id);
		void StatusService.refreshProject(id);
		return project;
	});

	ipcMain.handle("projects:inspectPath", (_, projectPath: string) => {
		return ProjectService.inspectPath(projectPath);
	});

	ipcMain.handle("projects:scan", (_, rootPath: string, depth: number) => {
		return ProjectService.scanForProjects(rootPath, depth);
	});

	ipcMain.handle("projects:applyAlias", (_, aliasId: string) => {
		const count = ProjectService.applyAlias(aliasId);
		void StatusService.refresh("existence");
		return count;
	});

	ipcMain.handle("projects:refreshStatus", (_, force?: boolean) => {
		return StatusService.refresh(force ? "force" : "auto");
	});
}
