import type { ElectronApi } from "@common/api/api.types";

type FoldersApi = ElectronApi["folders"];

export const foldersApi: FoldersApi = {
	getAll: () => window.api.folders.getAll(),

	add: (folder) => window.api.folders.add(folder),

	remove: (id, deleteProjects) => window.api.folders.remove(id, deleteProjects),

	update: (id, data) => window.api.folders.update(id, data),

	openInIde: (id) => window.api.folders.openInIde(id),

	onChanged: (callback) => window.api.folders.onChanged(callback),
};
