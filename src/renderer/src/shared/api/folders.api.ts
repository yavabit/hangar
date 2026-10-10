export const foldersApi = {
	getAll: () => window.api.folders.getAll(),

	add: (project) => window.api.folders.add(project),

	remove: (id) => window.api.folders.remove(id),

	update: (id, data) => window.api.folders.update(id, data),
};

export type ProjectsAPI = typeof foldersApi;