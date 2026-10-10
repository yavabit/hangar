import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { ElectronApi } from "../shared/api/api.types";
import type { StoreType } from "../shared/schemas/store.schema";

const api: ElectronApi = {
	settings: {
		get: () => ipcRenderer.invoke("settings:get"),
		set: (settings) => ipcRenderer.invoke("settings:set", settings),
	},
	projects: {
		getAll: () => ipcRenderer.invoke("projects:getAll"),
		add: (project) => ipcRenderer.invoke("projects:add", project),
		remove: (id) => ipcRenderer.invoke("projects:remove", id),
		update: (id, data) => ipcRenderer.invoke("projects:update", id, data),
		openFolder: (projectPath) => ipcRenderer.invoke("projects:openFolder", projectPath),
		openInIde: (projectPath) => ipcRenderer.invoke("projects:openInIde", projectPath),
		inspectPath: (projectPath) => ipcRenderer.invoke("projects:inspectPath", projectPath),
	},
	folders: {
		getAll: () => ipcRenderer.invoke("folders:getAll"),
		add: (folder) => ipcRenderer.invoke("folders:add", folder),
		remove: (id, deleteProjects) => ipcRenderer.invoke("folders:remove", id, deleteProjects),
		update: (id, data) => ipcRenderer.invoke("folders:update", id, data),
	},
	fileSystem: {
		selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
	},
	app: {
		get: () => ipcRenderer.invoke('app:get'),
		onLastOpenedUpdated: (callback) => {
			const listener = (_event: unknown, projects: StoreType["projects"]): void => callback(projects);
			ipcRenderer.on("app:lastOpenedUpdated", listener);
			return (): void => {
				ipcRenderer.removeListener("app:lastOpenedUpdated", listener);
			};
		},
	}
};

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI;
	// @ts-ignore (define in dts)
	window.api = api;
}
