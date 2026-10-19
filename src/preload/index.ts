import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { ElectronApi } from "../shared/api/api.types";

/** Подписка на событие из main. Возвращает функцию отписки */
const subscribe = <T>(channel: string, callback: (payload: T) => void): (() => void) => {
	const listener = (_event: unknown, payload: T): void => callback(payload);
	ipcRenderer.on(channel, listener);
	return (): void => {
		ipcRenderer.removeListener(channel, listener);
	};
};

const api: ElectronApi = {
	settings: {
		get: () => ipcRenderer.invoke("settings:get"),
		set: (settings) => ipcRenderer.invoke("settings:set", settings),
	},
	projects: {
		getAll: () => ipcRenderer.invoke("projects:getAll"),
		add: (project) => ipcRenderer.invoke("projects:add", project),
		addMany: (projects) => ipcRenderer.invoke("projects:addMany", projects),
		import: (items, options) => ipcRenderer.invoke("projects:import", items, options),
		remove: (id) => ipcRenderer.invoke("projects:remove", id),
		update: (id, data) => ipcRenderer.invoke("projects:update", id, data),
		openFolder: (id) => ipcRenderer.invoke("projects:openFolder", id),
		openInIde: (id) => ipcRenderer.invoke("projects:openInIde", id),
		openTerminal: (id) => ipcRenderer.invoke("projects:openTerminal", id),
		inspectPath: (projectPath) => ipcRenderer.invoke("projects:inspectPath", projectPath),
		scan: (rootPath, depth) => ipcRenderer.invoke("projects:scan", rootPath, depth),
		applyAlias: (aliasId) => ipcRenderer.invoke("projects:applyAlias", aliasId),
		refreshStatus: (force) => ipcRenderer.invoke("projects:refreshStatus", force),
		onChanged: (callback) => subscribe("projects:changed", callback),
		onHealth: (callback) => subscribe("projects:health", callback),
		onCheckedAt: (callback) => subscribe("projects:checkedAt", callback),
	},
	git: {
		branches: (projectId) => ipcRenderer.invoke("git:branches", projectId),
		switchBranch: (projectId, branch) => ipcRenderer.invoke("git:switchBranch", projectId, branch),
	},
	folders: {
		getAll: () => ipcRenderer.invoke("folders:getAll"),
		add: (folder) => ipcRenderer.invoke("folders:add", folder),
		remove: (id, deleteContents) => ipcRenderer.invoke("folders:remove", id, deleteContents),
		update: (id, data) => ipcRenderer.invoke("folders:update", id, data),
		openInIde: (id) => ipcRenderer.invoke("folders:openInIde", id),
		onChanged: (callback) => subscribe("folders:changed", callback),
	},
	fileSystem: {
		selectFolder: (defaultPath) => ipcRenderer.invoke("dialog:selectFolder", defaultPath),
	},
	app: {
		get: () => ipcRenderer.invoke("app:get"),
		showPalette: () => ipcRenderer.invoke("app:showPalette"),
		hidePalette: () => ipcRenderer.invoke("app:hidePalette"),
		onPaletteShown: (callback) => subscribe("palette:shown", () => callback()),
		openInMain: (route) => ipcRenderer.invoke("app:openInMain", route),
		onNavigate: (callback) => subscribe("app:navigate", callback),
	},
	dev: {
		getInfo: () => ipcRenderer.invoke("dev:getInfo"),
		openDataFolder: () => ipcRenderer.invoke("dev:openDataFolder"),
		openDevTools: () => ipcRenderer.invoke("dev:openDevTools"),
		relaunch: () => ipcRenderer.invoke("dev:relaunch"),
		resetData: () => ipcRenderer.invoke("dev:resetData"),
	},
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
