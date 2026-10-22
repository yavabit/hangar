import { ipcMain } from "electron";
import { UpdateService } from "../services/update.service";

export function registerUpdateIpc(): void {
	ipcMain.handle("updates:getStatus", () => UpdateService.getStatus());
	ipcMain.handle("updates:check", () => UpdateService.check());
	ipcMain.handle("updates:download", () => UpdateService.download());
	ipcMain.handle("updates:install", () => UpdateService.install());
}
