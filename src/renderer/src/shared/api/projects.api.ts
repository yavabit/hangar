export const projectsApi = {
	getAll: () => window.api.projects.getAll(),

	add: (project) => window.api.projects.add(project),

	remove: (id) => window.api.projects.remove(id),

	update: (id, data) => window.api.projects.update(id, data),

	openFolder: (projectPath: string) => window.api.projects.openFolder(projectPath),

	openInIde: (projectPath: string) => window.api.projects.openInIde(projectPath),
};

export type ProjectsAPI = typeof projectsApi;