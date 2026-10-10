import { ipcMain } from "electron";
import { store } from "../storage/store";

export function registerAppIpc(): void {
	ipcMain.handle("app:get", () => {
		return store.store;
	});
}
