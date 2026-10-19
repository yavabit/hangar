import type { AppSettings, Folder, Project } from "../schemas/store.schema";
import type { StackId } from "../utils/stacks";

export type SaveSettingsResult = {
	settings: AppSettings;
	/** Предупреждения, например «сочетание клавиш занято» */
	warnings: string[];
};

export type WindowInfo = {
	platform: NodeJS.Platform;
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
	dataFile: string;
	userData: string;
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
	/** Инструменты режима разработчика */
	dev: {
		getInfo: () => Promise<DevInfo>;
		openDataFolder: () => Promise<void>;
		openDevTools: () => Promise<void>;
		relaunch: () => Promise<void>;
		/** Стирает проекты, папки и настройки и перезапускает приложение */
		resetData: () => Promise<void>;
	};
}
