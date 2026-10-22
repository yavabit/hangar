import { app, BrowserWindow, ipcMain, shell } from "electron";
import { store } from "../storage/store";
import { resetTrayState } from "../tray";
import type { DevInfo } from "../../shared/api/api.types";

/**
 * При npm run dev electron-vite завершается вместе с Electron: новый процесс остался бы без dev-сервера
 * и держал бы блокировку одного экземпляра, из-за которой следующий npm run dev сразу закрывается.
 * Поэтому в разработке окна только перезагружаются
 */
const relaunch = (): void => {
	if (!app.isPackaged) {
		BrowserWindow.getAllWindows().forEach((window) => window.reload());
		return;
	}

	app.relaunch();
	app.exit(0);
};

export function registerDevIpc(): void {
	ipcMain.handle("dev:getInfo", (): DevInfo => ({
		dataFile: store.path,
		userData: app.getPath("userData"),
	}));

	ipcMain.handle("dev:openDataFolder", async () => {
		await shell.openPath(app.getPath("userData"));
	});

	ipcMain.handle("dev:openDevTools", (event) => {
		event.sender.openDevTools({ mode: "detach" });
	});

	ipcMain.handle("dev:relaunch", relaunch);

	ipcMain.handle("dev:resetData", () => {
		store.clear();
		resetTrayState();
		relaunch();
	});
}
