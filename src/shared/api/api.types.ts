import type { AppSettings, Folder, Project } from "../schemas/store.schema";

export type SaveSettingsResult = {
	settings: AppSettings;
	/** Предупреждения, например «сочетание клавиш занято» */
	warnings: string[];
};

export type AppState = {
	settings: AppSettings;
	projects: Project[];
	folders: Folder[];
	health: ProjectsHealth;
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
};

export type ProjectsHealth = Record<Project["id"], ProjectHealth>;

/** Найденная при импорте папка проекта */
export type ScanCandidate = {
	path: string;
	name: string;
	gitUrl?: string;
	hasGit: boolean;
};

export type GitBranches = {
	current: string | null;
	local: string[];
	/** Ветки на сервере, для которых ещё нет локальной: "origin/feature" */
	remote: string[];
};

export type NewProject = Omit<Project, "id" | "lastModified"> & Partial<Pick<Project, "lastModified">>;

export interface ElectronApi {
	settings: {
		get: () => Promise<AppSettings>;
		set: (settings: AppSettings) => Promise<SaveSettingsResult>;
	};

	projects: {
		getAll: () => Promise<Project[]>;
		add: (project: NewProject) => Promise<Project>;
		addMany: (projects: NewProject[]) => Promise<Project[]>;
		remove: (id: string) => Promise<void>;
		update: (id: string, data: Partial<Project>) => Promise<Project>;
		/** Открывает папку проекта в проводнике */
		openFolder: (id: string) => Promise<Project>;
		/** Открывает проект в IDE и запоминает время открытия */
		openInIde: (id: string) => Promise<Project>;
		inspectPath: (projectPath: string) => Promise<PathInfo>;
		scan: (rootPath: string, depth: number) => Promise<ScanCandidate[]>;
		/** Переводит полные пути проектов внутри папки алиаса на сам алиас */
		applyAlias: (aliasId: string) => Promise<number>;
		/** Проверка папок, git и дат изменения. Без force git проверяется не чаще интервала из настроек */
		refreshStatus: (force?: boolean) => Promise<void>;
		onChanged: (callback: (projects: Project[]) => void) => () => void;
		onHealth: (callback: (health: ProjectsHealth) => void) => () => void;
	};

	git: {
		branches: (projectId: string) => Promise<GitBranches>;
		/** Переключает ветку. Ветка с сервера ("origin/x") создаётся локально с отслеживанием */
		switchBranch: (projectId: string, branch: string) => Promise<void>;
	};

	folders: {
		getAll: () => Promise<Folder[]>;
		add: (folder: Omit<Folder, "id">) => Promise<Folder>;
		/** Возвращает актуальный список проектов после удаления папки */
		remove: (id: string, deleteProjects: boolean) => Promise<Project[]>;
		update: (id: string, data: Partial<Folder>) => Promise<void>;
	};

	fileSystem: {
		/** defaultPath — папка, с которой откроется диалог */
		selectFolder: (defaultPath?: string) => Promise<string | null>;
	};

	app: {
		get: () => Promise<AppState>;
		/** Прячет окно (в трей) */
		hide: () => Promise<void>;
		onOpenPalette: (callback: (options: { fromHotkey: boolean }) => void) => () => void;
	};
}
