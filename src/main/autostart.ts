import { app } from "electron";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";
import type { AppSettings } from "../shared/schemas/store.schema";

/** Аргумент запуска при входе в систему: по нему окно не показывается, если так выбрано в настройках */
const LOGIN_ARG = "--login";

const linuxEntryPath = (): string =>
	join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "autostart", "hangar.desktop");

/** На Linux автозапуск — файл .desktop в ~/.config/autostart, его читают GNOME, KDE и другие окружения */
const applyLinux = (openAtLogin: boolean): void => {
	const file = linuxEntryPath();
	if (!openAtLogin) {
		rmSync(file, { force: true });
		return;
	}

	// У AppImage process.execPath указывает во временную точку монтирования, путь к самому файлу — в APPIMAGE
	const executable = process.env.APPIMAGE ?? process.execPath;
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(
		file,
		[
			"[Desktop Entry]",
			"Type=Application",
			"Name=Hangar",
			`Exec="${executable}" ${LOGIN_ARG}`,
			"X-GNOME-Autostart-enabled=true",
			"",
		].join("\n"),
	);
};

/**
 * Записывает автозапуск в систему: на Windows — ключ Run в реестре, на macOS — объект входа.
 * При запуске приложения вызывается без userChanged и не трогает отключение в диспетчере задач Windows,
 * а при включении в настройках — снимает его. В режиме разработки не делает ничего: в автозапуск попал бы electron.exe
 */
export const applyAutostart = ({ openAtLogin }: AppSettings["startup"], userChanged = false): void => {
	if (!app.isPackaged) {
		return;
	}

	if (process.platform === "linux") {
		applyLinux(openAtLogin);
		return;
	}

	app.setLoginItemSettings({
		openAtLogin,
		args: [LOGIN_ARG],
		...(userChanged && process.platform === "win32" ? { enabled: openAtLogin } : {}),
	});
};

/** Приложение запущено системой при входе, а не пользователем */
export const wasOpenedAtLogin = (): boolean =>
	process.argv.includes(LOGIN_ARG) ||
	(process.platform === "darwin" && app.getLoginItemSettings().wasOpenedAtLogin);
