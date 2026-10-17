import { globalShortcut } from "electron";
import { sendToRenderer, showMainWindow } from "./window";

let registered: string | null = null;

/**
 * Назначает глобальное сочетание клавиш, которое показывает окно и открывает поиск.
 * Возвращает текст предупреждения, если назначить не удалось.
 */
export function applyGlobalHotkey(accelerator: string): string | null {
	if (registered === accelerator) {
		return null;
	}

	if (registered) {
		globalShortcut.unregister(registered);
		registered = null;
	}

	if (!accelerator) {
		return null;
	}

	try {
		const ok = globalShortcut.register(accelerator, () => {
			showMainWindow();
			sendToRenderer("app:openPalette", { fromHotkey: true });
		});

		if (!ok) {
			return `Сочетание ${accelerator} уже занято другим приложением`;
		}

		registered = accelerator;
		return null;
	} catch {
		return `Некорректное сочетание клавиш: ${accelerator}`;
	}
}

export function getRegisteredHotkey(): string | null {
	return registered;
}
