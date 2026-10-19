import { ipcMain } from "electron";
import { FoldersStorage } from "../storage/folders.storage";
import { ProjectsStorage } from "../storage/projects.storage";
import { ProjectService } from "../services/projects.service";
import { Folder } from "../../shared/schemas/store.schema";
import type { FolderRemoveResult } from "../../shared/api/api.types";

export function registerFoldersIpc(): void {
	ipcMain.handle("folders:getAll", () => {
		return FoldersStorage.getAll();
	});

	ipcMain.handle("folders:add", (_, folder: Omit<Folder, "id">) => {
		return FoldersStorage.add(folder);
	});

	ipcMain.handle("folders:remove", (_, id: string, deleteContents: boolean): FolderRemoveResult => {
		const parentId = FoldersStorage.getById(id)?.parentId;
		const removed = FoldersStorage.remove(id, deleteContents);

		if (deleteContents) {
			ProjectsStorage.removeByFolders(removed);
		} else {
			ProjectsStorage.moveFromFolder(id, parentId);
		}

		return { folders: FoldersStorage.getAll(), projects: ProjectsStorage.getAll() };
	});

	ipcMain.handle("folders:update", (_, id: string, patch: Partial<Folder>) => {
		FoldersStorage.update(id, patch);
	});

	ipcMain.handle("folders:openInIde", (_, id: string) => {
		return ProjectService.openFolderInIde(id);
	});
}
