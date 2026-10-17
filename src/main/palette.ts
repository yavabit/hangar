import { BrowserWindow, screen } from "electron";
import { getPreloadPath, loadRenderer } from "./window";

/** С запасом по краям: тень окна поиска рисуется внутри страницы */
const PALETTE_WIDTH = 760;
const PALETTE_HEIGHT = 560;

let palette: BrowserWindow | null = null;

const getPalette = (): BrowserWindow | null => (palette && !palette.isDestroyed() ? palette : null);

/**
 * Отдельное окно быстрого поиска для глобального сочетания клавиш: небольшое, поверх всех окон,
 * без рамки и панели задач. Создаётся заранее и скрыто, чтобы открываться мгновенно.
 */
export function createPaletteWindow(): BrowserWindow {
	const window = new BrowserWindow({
		width: PALETTE_WIDTH,
		height: PALETTE_HEIGHT,
		show: false,
		frame: false,
		transparent: true,
		backgroundColor: "#00000000",
		hasShadow: false,
		resizable: false,
		movable: false,
		minimizable: false,
		maximizable: false,
		fullscreenable: false,
		skipTaskbar: true,
		alwaysOnTop: true,
		webPreferences: {
			preload: getPreloadPath(),
			sandbox: false,
		},
	});

	window.on("blur", () => window.hide());
	loadRenderer(window, { window: "palette" });

	palette = window;
	return window;
}

/** Показывает окно поиска по центру экрана, на котором сейчас курсор */
export function showPalette(): void {
	const window = getPalette() ?? createPaletteWindow();
	const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
	const { x, y, width, height } = display.workArea;

	window.setBounds({
		x: Math.round(x + (width - PALETTE_WIDTH) / 2),
		y: Math.round(y + height * 0.16),
		width: PALETTE_WIDTH,
		height: PALETTE_HEIGHT,
	});
	window.show();
	window.focus();
	window.webContents.send("palette:shown");
}

export function hidePalette(): void {
	getPalette()?.hide();
}
