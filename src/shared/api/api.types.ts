import type { AppSettings, Folder, Project } from "../schemas/store.schema";
import type { StackId } from "../utils/stacks";

export type SaveSettingsResult = {
	settings: AppSettings;
	/** Предупреждения, например «сочетание клавиш занято» */
	warnings: string[];
};

/** Как process.platform в Node.js: типы Node интерфейсу недоступны */
export type Platform = "aix" | "android" | "cygwin" | "darwin" | "freebsd" | "haiku" | "linux" | "netbsd" | "openbsd" | "sunos" | "win32";

export type WindowInfo = {
	platform: Platform;
	/** Окно с полупрозрачным фоном Windows 11 (Mica) */
	mica: boolean;
};

export type AppState = {
	settings: AppSettings;
	projects: Project[];
	folders: Folder[];
	health: ProjectsHealth;
	/** Когда статусы проверялись полностью */
	checkedAt: string | null;
	window: WindowInfo;
	/** Версия приложения из package.json */
	version: string;
	/** Собранное приложение, а не запуск через npm run dev: автозапуск и обновления работают только в нём */
	packaged: boolean;
	update: UpdateStatus;
};

export type UpdateState =
	/** В режиме разработки обновления не проверяются */
	| { state: "disabled" }
	| { state: "idle" }
	| { state: "checking" }
	| { state: "latest" }
	| { state: "available"; version: string }
	| { state: "downloading"; version: string; percent: number }
	/** Скачано и поставится при перезапуске или выходе */
	| { state: "ready"; version: string }
	| { state: "error"; message: string };

export type UpdateStatus = UpdateState & {
	/** Когда проверка последний раз прошла успешно */
	checkedAt: string | null;
	/** Обновление ставится из приложения. На macOS без подписи Apple — только скачать со страницы релиза */
	canInstall: boolean;
	/** Страница релиза на GitHub */
	releaseUrl: string;
};

/** Сведения о папке проекта, найденные на диске */
export type PathInfo = {
	name: string;
	gitUrl?: string;
	resolvedPath: string;
	exists: boolean;
};

/** Локальное состояние git-репозитория, без обращения к серверу */
export type GitInfo = {
	/** null — detached HEAD */
	branch: string | null;
	/** Изменённые, новые и удалённые файлы */
	changes: number;
	/** Коммиты, которые не отправлены */
	ahead: number;
	/** Коммиты с сервера, которых нет локально (по данным последнего fetch) */
	behind: number;
	hasUpstream: boolean;
};

export type ProjectHealth = {
	exists: boolean;
	/** null — не git-репозиторий или git не установлен */
	git: GitInfo | null;
	/** Стек, определённый по файлам проекта */
	/** Стеки проекта, главный первым: у фронтенда с бэкендом в одной папке их несколько */
	stacks: StackId[];
};

export type ProjectsHealth = Record<Project["id"], ProjectHealth>;

/** Найденная при импорте папка проекта */
export type ScanCandidate = {
	path: string;
	name: string;
	gitUrl?: string;
	hasGit: boolean;
	/** Папки на диске между выбранной папкой и проектом: ["Заказчик 1"] для D:\Work\Заказчик 1\shop */
	dirs: string[];
};

export type ImportItem = {
	project: NewProject;
	dirs: string[];
};

export type ImportOptions = {
	/** Папка Hangar, в которую добавить проекты */
	folderId?: string;
	/** Повторить структуру папок на диске вложенными папками Hangar */
	keepStructure: boolean;
};

export type FolderRemoveResult = {
	folders: Folder[];
	projects: Project[];
};

export type OpenFolderResult = {
	opened: number;
	/** Проекты, папки которых не нашлись на диске */
	skipped: number;
};

export type GitBranches = {
	current: string | null;
	local: string[];
	/** Ветки на сервере, для которых ещё нет локальной: "origin/feature" */
	remote: string[];
};

export type NewProject = Omit<Project, "id" | "lastModified"> & Partial<Pick<Project, "lastModified">>;

export type DevInfo = {
	app: {
		version: string;
		/** Собранное приложение или npm run dev */
		packaged: boolean;
		executable: string;
		/** Когда собрано, ISO */
		builtAt: string;
		/** Когда установлена эта версия: дата создания файла приложения. null при npm run dev */
		installedAt: string | null;
		/** Время работы процесса, в секундах */
		uptime: number;
	};
	system: {
		/** «Windows 11 Home Single Language 10.0.26300» */
		name: string;
		platform: string;
		arch: string;
		cpu: string;
		cores: number;
		/** Память, в байтах */
		memory: number;
		locale: string;
	};
	/** Версии Electron, Chromium, Node.js, V8 и библиотек движка */
	engine: Record<string, string>;
	data: {
		userData: string;
		dataFile: string;
		/** Размер файла данных, в байтах */
		dataSize: number;
		projects: number;
		folders: number;
		aliases: number;
	};
	/** Установленные версии пакетов из package.json на момент сборки */
	packages: Record<string, string>;
};

/** Что лежит в выбранном для импорта файле: показывается перед заменой данных */
export type DataImportPreview = {
	file: string;
	/** Версия Hangar, из которой сделана выгрузка */
	appVersion: string | null;
	exportedAt: string | null;
	projects: number;
	folders: number;
	aliases: number;
};

/** Сведения о среде для интерфейса. Только чтение: доступа к IPC через них нет */
export type RuntimeInfo = {
	process: {
		platform: string;
		versions: { electron: string; chrome: string; node: string };
	};
};

export interface ElectronApi {
	settings: {
		get: () => Promise<AppSettings>;
		set: (settings: AppSettings) => Promise<SaveSettingsResult>;
	};

	projects: {
		getAll: () => Promise<Project[]>;
		add: (project: NewProject) => Promise<Project>;
		addMany: (projects: NewProject[]) => Promise<Project[]>;
		/** Добавляет найденные при импорте проекты, при необходимости создавая папки по структуре на диске */
		import: (items: ImportItem[], options: ImportOptions) => Promise<Project[]>;
		remove: (id: string) => Promise<void>;
		update: (id: string, data: Partial<Project>) => Promise<Project>;
		/** Открывает папку проекта в проводнике */
		openFolder: (id: string) => Promise<Project>;
		/** Открывает проект в IDE и запоминает время открытия */
		openInIde: (id: string) => Promise<Project>;
		/** Открывает консоль по умолчанию в папке проекта */
		openTerminal: (id: string) => Promise<void>;
		inspectPath: (projectPath: string) => Promise<PathInfo>;
		scan: (rootPath: string, depth: number) => Promise<ScanCandidate[]>;
		/** Переводит полные пути проектов внутри папки алиаса на сам алиас */
		applyAlias: (aliasId: string) => Promise<number>;
		/** Проверка папок, git и дат изменения. Без force git проверяется не чаще интервала из настроек */
		refreshStatus: (force?: boolean) => Promise<void>;
		onChanged: (callback: (projects: Project[]) => void) => () => void;
		onHealth: (callback: (health: ProjectsHealth) => void) => () => void;
		onCheckedAt: (callback: (checkedAt: string) => void) => () => void;
	};

	git: {
		branches: (projectId: string) => Promise<GitBranches>;
		/** Переключает ветку. Ветка с сервера ("origin/x") создаётся локально с отслеживанием */
		switchBranch: (projectId: string, branch: string) => Promise<void>;
	};

	folders: {
		getAll: () => Promise<Folder[]>;
		add: (folder: Omit<Folder, "id">) => Promise<Folder>;
		/** deleteContents — удалить вложенные папки и проекты, иначе они переедут на уровень выше */
		remove: (id: string, deleteContents: boolean) => Promise<FolderRemoveResult>;
		update: (id: string, data: Partial<Folder>) => Promise<void>;
		/** Открывает все проекты папки и вложенных папок: в VS Code — одним окном через workspace */
		openInIde: (id: string) => Promise<OpenFolderResult>;
		onChanged: (callback: (folders: Folder[]) => void) => () => void;
	};

	fileSystem: {
		/** defaultPath — папка, с которой откроется диалог */
		selectFolder: (defaultPath?: string) => Promise<string | null>;
	};

	app: {
		get: () => Promise<AppState>;
		/** Показывает отдельное окно быстрого поиска поверх всех окон */
		showPalette: () => Promise<void>;
		hidePalette: () => Promise<void>;
		/** Окно быстрого поиска показано: пора очистить запрос и поставить фокус */
		onPaletteShown: (callback: () => void) => () => void;
		/** Показывает главное окно и открывает в нём страницу */
		openInMain: (route: string) => Promise<void>;
		onNavigate: (callback: (route: string) => void) => () => void;
	};
	updates: {
		getStatus: () => Promise<UpdateStatus>;
		/** Проверка по кнопке: работает и при выключенной автоматической проверке */
		check: () => Promise<void>;
		download: () => Promise<void>;
		/** Закрывает приложение, ставит скачанное обновление и запускает новую версию */
		install: () => Promise<void>;
		onStatus: (callback: (status: UpdateStatus) => void) => () => void;
	};

	/** Инструменты режима разработчика */
	dev: {
		getInfo: () => Promise<DevInfo>;
		openDataFolder: () => Promise<void>;
		openDevTools: () => Promise<void>;
		relaunch: () => Promise<void>;
		/** Стирает проекты, папки и настройки и перезапускает приложение */
		resetData: () => Promise<void>;
		/** Сохраняет все данные в файл. Возвращает путь или null, если пользователь отменил */
		exportData: () => Promise<string | null>;
		/** Выбор файла для импорта и проверка его содержимого. null — выбор отменён */
		pickImport: () => Promise<DataImportPreview | null>;
		/** Заменяет данные выбранным файлом: текущие сохраняются копией рядом, приложение перезапускается */
		applyImport: () => Promise<void>;
		/** Копирует текст в буфер обмена через main: странице разрешения на буфер не выдаются */
		copyText: (text: string) => Promise<void>;
	};
}
