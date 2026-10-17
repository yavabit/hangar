import { app, ipcMain, dialog } from "electron";

export function registerFileSystemIpc(): void {
	ipcMain.handle("dialog:selectFolder", async (_, defaultPath?: string) => {
		const result = await dialog.showOpenDialog({
			properties: ["openDirectory"],
			title: "Выберите папку",
			buttonLabel: "Выбрать",
			defaultPath: defaultPath || app.getPath("documents"),
		});

		return result.canceled ? null : result.filePaths[0];
	});
}
