import { app, ipcMain, shell } from "electron";
import { store } from "../storage/store";
import { resetTrayState } from "../tray";
import type { DevInfo } from "../../shared/api/api.types";

const relaunch = (): void => {
	app.relaunch();
	app.exit(0);
};

export function registerDevIpc(): void {
	ipcMain.handle("dev:getInfo", (): DevInfo => ({
		dataFile: store.path,
		userData: app.getPath("userData"),
		version: app.getVersion(),
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
