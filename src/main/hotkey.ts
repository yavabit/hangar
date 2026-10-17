import { globalShortcut } from "electron";
import { showPalette } from "./palette";

let registered: string | null = null;

/**
 * Назначает глобальное сочетание клавиш, которое открывает окно быстрого поиска.
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
		const ok = globalShortcut.register(accelerator, showPalette);

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
