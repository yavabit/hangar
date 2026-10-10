import { store } from "./store";

import type { Folder } from "../../shared/schemas/store.schema";

export class FoldersStorage {
	static getAll(): Folder[] {
		return store.get("folders");
	}

	static getById(id: string): Folder | undefined {
		return store.get("folders").find((folder) => folder.id === id);
	}

	static add(project: Folder): Folder {
		const folders = store.get("folders");

		const folderID = crypto.randomUUID();

		const addFolder = { ...project, id: folderID };

		folders.push(addFolder);

		store.set("folders", folders);

		return addFolder;
	}

	static remove(id: string): void {
		const folders = store
			.get("folders")
			.filter((folder) => folder.id !== id);

		store.set("folders", folders);
	}

	static update(id: string, patch: Partial<Folder>): void {
		const folders = this.getAll();
		const index = folders.findIndex((folder) => folder.id === id);
		
		if (index !== -1) {
			folders[index] = { ...folders[index], ...patch };
			store.set("folders", folders);
		}
	}
}
