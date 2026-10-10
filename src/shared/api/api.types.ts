import type { AppSettings, Folder, Project, StoreType } from "../schemas/store.schema";

export type PathInfo = {
	name: string;
	gitUrl?: string;
};

export interface ElectronApi {
	settings: {
		get: () => Promise<AppSettings>;
		set: (settings: AppSettings) => Promise<{success: boolean} | void>;
	};

	projects: {
		getAll: () => Promise<Project[]>;
		add: (project: Omit<Project, "id">) => Promise<Project>;
		remove: (id: string) => Promise<void>;
		update: (id: string, data: Partial<Project>) => Promise<Project>;
		openFolder: (projectPath: string) => Promise<void>;
		openInIde: (projectPath: string) => Promise<void>;
		inspectPath: (projectPath: string) => Promise<PathInfo>;
	};

	folders: {
		getAll: () => Promise<Folder[]>;
		add: (folder: Omit<Folder, "id">) => Promise<Folder>;
		remove: (id: string, deleteProjects: boolean) => Promise<Project[]>;
		update: (id: string, data: Partial<Folder>) => Promise<void>;
	};

	fileSystem: {
		selectFolder: () => Promise<string | null>;
	};

	app: {
		get: () => Promise<StoreType>;
		onLastOpenedUpdated: (callback: (projects: StoreType["projects"]) => void) => () => void;
	};
}
