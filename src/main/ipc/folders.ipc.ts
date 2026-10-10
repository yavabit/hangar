import { ipcMain } from "electron";
import { FoldersStorage } from "../storage/folders.storage";
import { ProjectsStorage } from "../storage/projects.storage";
import { Folder } from "../../shared/schemas/store.schema";

export function registerFoldersIpc(): void {
	ipcMain.handle("folders:getAll", () => {
		return FoldersStorage.getAll();
	});

	ipcMain.handle("folders:add", (_, project) => {
		return FoldersStorage.add(project);
	});

	ipcMain.handle("folders:remove", (_, id: string, deleteProjects: boolean) => {
		if (deleteProjects) {
			ProjectsStorage.removeByFolder(id);
		} else {
			ProjectsStorage.detachFromFolder(id);
		}

		FoldersStorage.remove(id);

		return ProjectsStorage.getAll();
	});

	ipcMain.handle("folders:update", (_, id: string, patch: Partial<Folder>) => {
		FoldersStorage.update(id, patch);
	});
}
