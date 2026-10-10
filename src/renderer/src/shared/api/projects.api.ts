import type { ElectronApi } from "../../../../shared/api/api.types";

type ProjectsApi = ElectronApi["projects"];

export const projectsApi: ProjectsApi = {
	getAll: () => window.api.projects.getAll(),

	add: (project) => window.api.projects.add(project),

	remove: (id) => window.api.projects.remove(id),

	update: (id, data) => window.api.projects.update(id, data),

	openFolder: (projectPath) => window.api.projects.openFolder(projectPath),

	openInIde: (projectPath) => window.api.projects.openInIde(projectPath),

	inspectPath: (projectPath) => window.api.projects.inspectPath(projectPath),
};
