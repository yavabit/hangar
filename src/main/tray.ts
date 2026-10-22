import { app, Menu, nativeImage, Notification, Tray } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import Store from "electron-store";
import icon from "../../resources/icon.png?asset";
import type { Project } from "../shared/schemas/store.schema";
import type { UpdateStatus } from "../shared/api/api.types";
import { store } from "./storage/store";
import { ProjectsStorage } from "./storage/projects.storage";
import { ProjectService } from "./services/projects.service";
import { StatusService } from "./services/status.service";
import { UpdateService } from "./services/update.service";
import { SettingsStorage } from "./storage/settings.storage";
import { getRegisteredHotkey } from "./hotkey";
import { getMainWindow, sendToMainWindow, setQuitting, showMainWindow } from "./window";
import { showPalette } from "./palette";

const MAX_FAVORITES = 10;
const MAX_RECENT = 5;

//@ts-ignore def export
const StoreClass = (Store.default ?? Store) as typeof Store;

/** Служебные флаги интерфейса, которые не относятся к данным пользователя */
const uiState = new StoreClass<{ trayHintShown: boolean }>({
	name: "ui-state",
	defaults: { trayHintShown: false },
});

let tray: Tray | null = null;
/** Версия и состояние, о которых уже напомнили: уведомление не повторяется при каждой проверке */
let notifiedUpdate: string | null = null;

export const resetTrayState = (): void => uiState.clear();

const openProject = async (project: Project): Promise<void> => {
	try {
		await ProjectService.openProjectInIde(project.id);
		void StatusService.refreshProject(project.id);
	} catch (error) {
		new Notification({
			title: `Не удалось открыть «${project.name}»`,
			body: error instanceof Error ? error.message : String(error),
		}).show();
	}
};


const projectItem = (project: Project): MenuItemConstructorOptions => ({
	label: project.name,
	click: () => void openProject(project),
});

const buildMenu = (): Menu => {
	const projects = ProjectsStorage.getAll();

	const favorites = projects
		.filter((p) => p.isFavorite)
		.sort((a, b) => a.name.localeCompare(b.name, "ru"))
		.slice(0, MAX_FAVORITES);

	const recent = projects
		.filter((p) => p.lastOpenedAt && !p.isFavorite)
		.sort((a, b) => (b.lastOpenedAt ?? "").localeCompare(a.lastOpenedAt ?? ""))
		.slice(0, MAX_RECENT);

	const hotkey = getRegisteredHotkey();

	const template: MenuItemConstructorOptions[] = [
		{ label: "Открыть Hangar", click: showMainWindow },
		{
			label: "Найти проект…",
			click: showPalette,
			...(hotkey ? { accelerator: hotkey, registerAccelerator: false } : {}),
		},
		{ type: "separator" },
		{ label: "Избранное", enabled: false },
		...(favorites.length ? favorites.map(projectItem) : [{ label: "Пусто", enabled: false }]),
	];

	const update = UpdateService.getStatus();
	if (update.state === "ready") {
		template.push(
			{ type: "separator" },
			{ label: `Обновить до ${update.version} и перезапустить`, click: () => UpdateService.install() },
		);
	}

	if (recent.length) {
		template.push({ type: "separator" }, { label: "Недавние", enabled: false }, ...recent.map(projectItem));
	}

	template.push(
		{ type: "separator" },
		{
			label: "Выход",
			click: () => {
				setQuitting();
				app.quit();
			},
		},
	);

	return Menu.buildFromTemplate(template);
};

export const rebuildTrayMenu = (): void => {
	tray?.setContextMenu(buildMenu());
};

export function createTray(): void {
	const image = nativeImage.createFromPath(icon).resize({ width: 16, height: 16, quality: "best" });

	tray = new Tray(image);
	tray.setToolTip("Hangar");
	tray.on("click", showMainWindow);

	rebuildTrayMenu();
	store.onDidChange("projects", rebuildTrayMenu);
	store.onDidChange("settings", rebuildTrayMenu);
}

const openSettings = (): void => {
	showMainWindow();
	sendToMainWindow("app:navigate", "/settings");
};

/**
 * Системное уведомление о новой версии, когда окно Hangar не в фокусе: приложение может неделями жить в трее.
 * Если окно открыто, о версии сообщит сам интерфейс
 */
export function notifyAboutUpdate(status: UpdateStatus): void {
	const waitsForUser =
		status.state === "ready" ||
		(status.state === "available" && !(status.canInstall && SettingsStorage.get().updates.autoDownload));

	if (!waitsForUser || !("version" in status) || getMainWindow()?.isFocused()) {
		return;
	}

	const key = `${status.state}:${status.version}`;
	if (notifiedUpdate === key) {
		return;
	}
	notifiedUpdate = key;

	const notification = new Notification(
		status.state === "ready"
			? {
				title: `Hangar ${status.version} готов к установке`,
				body: "Перезапустите приложение из меню трея или настроек. Иначе обновление установится при выходе",
			}
			: {
				title: `Вышла версия Hangar ${status.version}`,
				body: "Скачать её можно в настройках",
			},
	);
	notification.on("click", openSettings);
	notification.show();
}

/** Один раз подсказывает, что приложение не закрылось, а ушло в трей */
export function showTrayHintOnce(): void {
	if (!tray || uiState.get("trayHintShown")) {
		return;
	}

	uiState.set("trayHintShown", true);

	const hotkey = getRegisteredHotkey();
	const content = hotkey
		? `Откройте его значком в трее или сочетанием ${hotkey.replace("CommandOrControl", "Ctrl")}`
		: "Откройте его значком в трее";

	if (process.platform === "win32") {
		tray.displayBalloon({ title: "Hangar работает в трее", content, iconType: "info" });
	} else {
		new Notification({ title: "Hangar работает в трее", body: content }).show();
	}
}
