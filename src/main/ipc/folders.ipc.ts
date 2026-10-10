import { ipcMain } from "electron";
import { FoldersStorage } from "../storage/folders.storage";
import { Folder } from "../../shared/schemas/store.schema";

export function registerFoldersIpc(): void {
	ipcMain.handle("folders:getAll", () => {
		return FoldersStorage.getAll();
	});

	ipcMain.handle("folders:add", (_, project) => {
		return FoldersStorage.add(project);
	});

	ipcMain.handle("folders:remove", (_, id: string) => {
		FoldersStorage.remove(id);
	});

	ipcMain.handle("folders:update", (_, id: string, patch: Partial<Folder>) => {
		FoldersStorage.update(id, patch);
	});
}
