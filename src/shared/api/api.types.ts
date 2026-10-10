import type { AppSettings, Folder, Project, StoreType } from "../schemas/store.schema";

export interface ElectronApi {
	settings: {
		get: () => Promise<AppSettings>;
		set: (settings: AppSettings) => Promise<{success: boolean} | void>;
	};

	projects: {
		getAll: () => Promise<Project[]>;
		add: (project: Omit<Project, "id">) => Promise<Project>;
		remove: (id: string) => Promise<void>;
		update: (id: string, data: Project) => Promise<Project>;
		openFolder: (projectPath: string) => Promise<void>;
		openInIde: (projectPath: string) => Promise<void>;
	};

	folders: {
		getAll: () => Promise<Project[]>;
		add: (project: Omit<Folder, "id">) => Promise<Folder>;
		remove: (id: string) => Promise<void>;
		update: (id: string, data: Folder) => Promise<void>;
	};

	fileSystem: {
		selectFolder: () => Promise<string>;
	};

	app: {
		get: () => Promise<StoreType>;
		onLastOpenedUpdated: (callback: (projects: StoreType["projects"]) => void) => () => void;
	};
}
