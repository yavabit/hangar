import type { ElectronApi } from "@common/api/api.types";

type ProjectsApi = ElectronApi["projects"];

export const projectsApi: ProjectsApi = {
	getAll: () => window.api.projects.getAll(),

	add: (project) => window.api.projects.add(project),

	addMany: (projects) => window.api.projects.addMany(projects),

	remove: (id) => window.api.projects.remove(id),

	update: (id, data) => window.api.projects.update(id, data),

	openFolder: (id) => window.api.projects.openFolder(id),

	openInIde: (id) => window.api.projects.openInIde(id),

	inspectPath: (projectPath) => window.api.projects.inspectPath(projectPath),

	scan: (rootPath, depth) => window.api.projects.scan(rootPath, depth),

	applyAlias: (aliasId) => window.api.projects.applyAlias(aliasId),

	refreshStatus: (force) => window.api.projects.refreshStatus(force),

	onChanged: (callback) => window.api.projects.onChanged(callback),

	onHealth: (callback) => window.api.projects.onHealth(callback),
};
