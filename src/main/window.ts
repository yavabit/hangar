import { BrowserWindow, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { SettingsStorage } from "./storage/settings.storage";

const WINDOW_BACKGROUND = "#f4f5fb";

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

export const getMainWindow = (): BrowserWindow | null =>
	mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;

/** Отмечает, что приложение действительно закрывается, а не сворачивается в трей */
export const setQuitting = (): void => {
	isQuitting = true;
};

export const sendToRenderer = (channel: string, ...args: unknown[]): void => {
	getMainWindow()?.webContents.send(channel, ...args);
};

export const showMainWindow = (): void => {
	const window = getMainWindow();
	if (!window) {
		return;
	}

	if (window.isMinimized()) {
		window.restore();
	}
	window.show();
	window.focus();
};

export function createMainWindow({ onHiddenToTray }: { onHiddenToTray: () => void }): BrowserWindow {
	const window = new BrowserWindow({
		width: 1400,
		height: 800,
		minWidth: 960,
		minHeight: 600,
		title: "Project Launcher",
		backgroundColor: WINDOW_BACKGROUND,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
		},
	});

	window.on("ready-to-show", () => {
		window.show();
	});

	window.on("close", (event) => {
		if (!isQuitting && SettingsStorage.get().common.minimizeToTray) {
			event.preventDefault();
			window.hide();
			onHiddenToTray();
		}
	});

	window.webContents.setWindowOpenHandler((details) => {
		if (/^https?:\/\//i.test(details.url)) {
			shell.openExternal(details.url);
		}
		return { action: "deny" };
	});

	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		window.loadFile(join(__dirname, "../renderer/index.html"));
	}

	mainWindow = window;
	return window;
}
