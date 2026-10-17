import { BrowserWindow, nativeTheme, shell } from "electron";
import { release } from "os";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import type { WindowInfo } from "../shared/api/api.types";
import { SettingsStorage } from "./storage/settings.storage";

/** Высота своей шапки окна: под неё подстраиваются системные кнопки Windows */
export const TITLEBAR_HEIGHT = 44;

/** Совпадают с фоном сплэш-экрана и страницы в index.html и theme.css */
const THEME_COLORS = {
	dark: { background: "#0b0c10", symbol: "#c9ccd3" },
	light: { background: "#eceff4", symbol: "#3b4150" },
};

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

export const getThemeColors = (): (typeof THEME_COLORS)["dark"] =>
	THEME_COLORS[nativeTheme.shouldUseDarkColors ? "dark" : "light"];

/** Mica — полупрозрачный фон окна Windows 11 (сборка 22000 и новее) */
export const supportsMica = (): boolean =>
	process.platform === "win32" && Number(release().split(".")[2] ?? 0) >= 22000;

export const getWindowInfo = (): WindowInfo => ({
	platform: process.platform,
	mica: supportsMica(),
});

export const getMainWindow = (): BrowserWindow | null =>
	mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;

/** Отмечает, что приложение действительно закрывается, а не сворачивается в трей */
export const setQuitting = (): void => {
	isQuitting = true;
};

/** Событие всем окнам: главному и окну быстрого поиска */
export const sendToRenderer = (channel: string, ...args: unknown[]): void => {
	for (const window of BrowserWindow.getAllWindows()) {
		if (!window.isDestroyed()) {
			window.webContents.send(channel, ...args);
		}
	}
};

export const sendToMainWindow = (channel: string, ...args: unknown[]): void => {
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

export const loadRenderer = (window: BrowserWindow, query?: Record<string, string>): void => {
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		const search = query ? `?${new URLSearchParams(query)}` : "";
		window.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}${search}`);
	} else {
		window.loadFile(join(__dirname, "../renderer/index.html"), { query });
	}
};

export const getPreloadPath = (): string => join(__dirname, "../preload/index.js");

export function createMainWindow({ onHiddenToTray }: { onHiddenToTray: () => void }): BrowserWindow {
	const mica = supportsMica();
	const colors = getThemeColors();
	const isMac = process.platform === "darwin";

	const window = new BrowserWindow({
		width: 1400,
		height: 860,
		minWidth: 980,
		minHeight: 620,
		title: "Hangar",
		backgroundColor: mica ? "#00000000" : colors.background,
		...(mica ? { backgroundMaterial: "mica" as const } : {}),
		titleBarStyle: "hidden",
		...(isMac
			? { trafficLightPosition: { x: 16, y: 15 } }
			: {
				titleBarOverlay: {
					color: mica ? "#00000000" : colors.background,
					symbolColor: colors.symbol,
					height: TITLEBAR_HEIGHT,
				},
			}),
		show: false,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: getPreloadPath(),
			sandbox: false,
		},
	});

	const applyThemeColors = (): void => {
		const next = getThemeColors();
		if (!isMac) {
			window.setTitleBarOverlay({ color: mica ? "#00000000" : next.background, symbolColor: next.symbol });
		}
		if (!mica) {
			window.setBackgroundColor(next.background);
		}
	};
	nativeTheme.on("updated", applyThemeColors);
	window.on("closed", () => nativeTheme.off("updated", applyThemeColors));

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

	loadRenderer(window);

	mainWindow = window;
	return window;
}
