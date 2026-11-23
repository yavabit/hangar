import { BrowserWindow, screen } from "electron";
import { getPreloadPath, hardenWebContents, loadRenderer } from "./window";

/** С запасом по краям: тень окна поиска рисуется внутри страницы */
const PALETTE_WIDTH = 760;
const PALETTE_HEIGHT = 560;

let palette: BrowserWindow | null = null;
let visibilitySequence = 0;

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
		...(process.platform === "win32" ? { opacity: 0 } : {}),
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
			backgroundThrottling: false,
			sandbox: true,
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	window.on("blur", () => {
		if (window.isVisible()) hidePalette();
	});
	window.on("hide", () => window.webContents.send("palette:hidden"));
	hardenWebContents(window);
	loadRenderer(window, { window: "palette" });

	palette = window;
	return window;
}

/** Показывает окно поиска по центру экрана, на котором сейчас курсор */
export function showPalette(): void {
	const window = getPalette() ?? createPaletteWindow();
	const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
	const { x, y, width, height } = display.workArea;

	const bounds = {
		x: Math.round(x + (width - PALETTE_WIDTH) / 2),
		y: Math.round(y + height * 0.16),
		width: PALETTE_WIDTH,
		height: PALETTE_HEIGHT,
	};
	const current = window.getBounds();
	if (current.x !== bounds.x || current.y !== bounds.y || current.width !== bounds.width || current.height !== bounds.height) {
		window.setBounds(bounds);
	}
	if (window.isVisible()) {
		window.focus();
		return;
	}
	const sequence = ++visibilitySequence;
	window.show();
	if (process.platform === "win32") {
		const reveal = (): void => {
			if (!window.isDestroyed() && window.isVisible() && sequence === visibilitySequence) window.setOpacity(1);
		};
		const fallback = setTimeout(reveal, 1000);
		void window.webContents.executeJavaScript("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
			.then(() => {
				clearTimeout(fallback);
				reveal();
			})
			.catch(() => {
				clearTimeout(fallback);
				reveal();
			});
	}
}

export function hidePalette(): void {
	const window = getPalette();
	if (!window || !window.isVisible()) return;
	visibilitySequence++;
	if (process.platform === "win32") window.setOpacity(0);
	window.hide();
}
