import { create } from "zustand";
import { DEFAULT_SETTINGS, type AppSettings, type Folder, type Project } from "@schemas/store.schema";
import type { ProjectsHealth } from "@common/api/api.types";

export type AppStore = {
	hydrated: boolean;
	loadError: string | null;

	settings: AppSettings;
	projects: Project[];
	folders: Folder[];
	/** Есть ли папка на диске и состояние git. Приходит из main, не сохраняется */
	health: ProjectsHealth;

	load: () => Promise<void>;

	setSettings: (s: AppSettings) => void;

	setProjects: (p: Project[]) => void;
	addProject: (p: Project) => void;
	updateProject: (id: string, p: Partial<Project>) => void;
	removeProject: (id: string) => void;

	setHealth: (health: ProjectsHealth) => void;

	setFolders: (f: Folder[]) => void;
	addFolder: (f: Folder) => void;
	updateFolder: (id: string, f: Partial<Folder>) => void;
	removeFolder: (id: string) => void;
};

export const useAppStore = create<AppStore>((set) => ({
	hydrated: false,
	loadError: null,

	settings: DEFAULT_SETTINGS,
	projects: [],
	folders: [],
	health: {},

	// --- LOAD ---
	load: async () => {
		set({ loadError: null });

		try {
			const state = await window.api.app.get();

			set({
				settings: state.settings,
				projects: state.projects,
				folders: state.folders,
				health: state.health,
				hydrated: true,
			});
		} catch (e) {
			console.error(e);
			set({ loadError: e instanceof Error ? e.message : String(e) });
		}
	},

	// --- SETTINGS ---
	setSettings: (settings) => {
		set({ settings });
	},

	// --- PROJECTS ---
	setProjects: (projects) => {
		set({ projects });
	},

	addProject: (project) =>
		set((state) => ({
			projects: [...state.projects, project],
		})),

	updateProject: (id, patch) =>
		set((state) => ({
			projects: state.projects.map((p) =>
				p.id === id ? { ...p, ...patch } : p,
			),
		})),

	removeProject: (id) =>
		set((state) => ({
			projects: state.projects.filter((p) => p.id !== id),
		})),

	setHealth: (health) => {
		set({ health });
	},

	// --- FOLDERS ---
	setFolders: (folders) => {
		set({ folders });
	},

	addFolder: (folder) =>
		set((state) => ({
			folders: [...state.folders, folder],
		})),

	updateFolder: (id, patch) =>
		set((state) => ({
			folders: state.folders.map((f) => (f.id === id ? { ...f, ...patch } : f)),
		})),

	removeFolder: (id) =>
		set((state) => ({
			folders: state.folders.filter((f) => f.id !== id),
		})),
}));
