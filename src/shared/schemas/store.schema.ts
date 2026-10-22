import { z } from "zod";

/**
 * Версия формата данных. До первого релиза не повышается и миграций нет:
 * недостающие настройки добираются из значений по умолчанию.
 */
export const STORE_VERSION = 1;

export const ProjectSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	/** Полный путь или путь через алиас: "@work/shop-frontend" */
	path: z.string(),
	/** Дата последнего изменения файлов проекта */
	lastModified: z.string().optional(),
	/** Когда проект последний раз открывали из лаунчера */
	lastOpenedAt: z.string().optional(),
	isFavorite: z.boolean(),
	folderId: z.uuid().optional(),
	icon: z.string().optional(),
	gitUrl: z.string().optional(),
	/** Часть ссылки после адреса таск-трекера (из папки или из настроек): "issues/42" */
	taskPath: z.string().optional(),
});

export const FolderSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().optional(),
	/** Родительская папка. Без неё папка лежит на верхнем уровне */
	parentId: z.uuid().optional(),
	/** Цвет папки. Без него папка берёт цвет родителя */
	color: z.string().optional(),
	/** Свой адрес таск-трекера: переопределяет адрес из настроек для проектов папки и вложенных папок */
	taskTrackerUrl: z.string().optional(),
	path: z.string().optional(),
	lastDate: z.string().optional(),
	icon: z.string().optional(),
});

export const PathAliasSchema = z.object({
  id: z.uuid(),
  alias: z.string(),
  path: z.string(),
  color: z.string(),
});

export const CommonSettingsSchema = z.object({
	defaultIDE: z.enum(["vscode", "webstorm", "intellij"]),
	defaultConsole: z.string(),
	taskTrackerUrl: z.string(),
	pathAliases: z.array(PathAliasSchema).optional(),
	/** Глобальное сочетание клавиш для вызова поиска. Пустая строка — выключено */
	globalHotkey: z.string(),
	/** Крестик окна сворачивает приложение в трей */
	minimizeToTray: z.boolean(),
});

export const StatusRefreshSettingsSchema = z.object({
	/** Проверять git и даты изменения при возврате в окно */
	onFocus: z.boolean(),
	/** Проверять по таймеру, пока окно открыто */
	background: z.boolean(),
	/** Минимальный интервал между проверками и период таймера, в минутах */
	intervalMinutes: z.number().min(1).max(240),
});

export const ThemeModeSchema = z.enum(["system", "light", "dark"]);

export const AppearanceSettingsSchema = z.object({
	theme: ThemeModeSchema,
});

export const StartupSettingsSchema = z.object({
	/** Запускать Hangar при входе в систему */
	openAtLogin: z.boolean(),
	/** При автозапуске не показывать окно: приложение сразу уходит в трей */
	startHidden: z.boolean(),
});

export const UpdateSettingsSchema = z.object({
	/** Проверять обновления при запуске и раз в несколько часов */
	autoCheck: z.boolean(),
	/** Скачивать найденное обновление сразу, без подтверждения */
	autoDownload: z.boolean(),
});

export const DeveloperSettingsSchema = z.object({
	enabled: z.boolean(),
});

export const AppSettingsSchema = z.object({
	common: CommonSettingsSchema,
	statusRefresh: StatusRefreshSettingsSchema,
	appearance: AppearanceSettingsSchema,
	startup: StartupSettingsSchema,
	updates: UpdateSettingsSchema,
	developer: DeveloperSettingsSchema,
});

export const StoreSchema = z.object({
	version: z.number(),
	settings: AppSettingsSchema,
	projects: z.array(ProjectSchema),
	folders: z.array(FolderSchema),
});

export type Project = z.infer<typeof ProjectSchema>;

export type Folder = z.infer<typeof FolderSchema>;

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type StatusRefreshSettings = z.infer<typeof StatusRefreshSettingsSchema>;

export type ThemeMode = z.infer<typeof ThemeModeSchema>;

export type StoreType = z.infer<typeof StoreSchema>;

export type PathAliasSchemaType = z.infer<typeof PathAliasSchema>;

export const DEFAULT_SETTINGS: AppSettings = {
	common: {
		pathAliases: [],
		defaultIDE: "vscode",
		defaultConsole: "powershell",
		taskTrackerUrl: "",
		globalHotkey: "CommandOrControl+Shift+Space",
		minimizeToTray: true,
	},
	statusRefresh: {
		onFocus: true,
		background: false,
		intervalMinutes: 5,
	},
	appearance: {
		theme: "system",
	},
	startup: {
		openAtLogin: false,
		startHidden: true,
	},
	updates: {
		autoCheck: true,
		autoDownload: true,
	},
	developer: {
		enabled: false,
	},
};

/** Сохранённые настройки поверх значений по умолчанию: новые поля появляются без миграций */
export const withDefaultSettings = (settings: Partial<AppSettings> | undefined): AppSettings => ({
	common: { ...DEFAULT_SETTINGS.common, ...settings?.common },
	statusRefresh: { ...DEFAULT_SETTINGS.statusRefresh, ...settings?.statusRefresh },
	appearance: { ...DEFAULT_SETTINGS.appearance, ...settings?.appearance },
	startup: { ...DEFAULT_SETTINGS.startup, ...settings?.startup },
	updates: { ...DEFAULT_SETTINGS.updates, ...settings?.updates },
	developer: { ...DEFAULT_SETTINGS.developer, ...settings?.developer },
});
