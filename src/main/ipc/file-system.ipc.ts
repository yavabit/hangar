// main.ts
import { app, ipcMain, dialog } from "electron";

export function registerFileSystemIpc(): void {
	ipcMain.handle("dialog:selectFolder", async () => {
		const result = await dialog.showOpenDialog({
			properties: ["openDirectory"],
			title: "Выберите папку",
			buttonLabel: "Выбрать",
			defaultPath: app.getPath("documents"),
		});

		return result.canceled ? null : result.filePaths[0];
	});
}
