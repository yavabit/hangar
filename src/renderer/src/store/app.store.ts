import { create } from "zustand";
import type { Folder, Project, StoreType } from "@schemas/store.schema";

export type AppStore = {
	hydrated: boolean;
	loadError: string | null;

	settings: StoreType["settings"];
	projects: StoreType["projects"];
	folders: StoreType["folders"];

	load: () => Promise<void>;

	setSettings: (s: StoreType["settings"]) => void;

	setProjects: (p: StoreType["projects"]) => void;
	addProject: (p: Project) => void;
	updateProject: (id: string, p: Partial<Project>) => void;
	removeProject: (id: string) => void;

	setFolders: (f: StoreType["folders"]) => void;
	addFolder: (f: Folder) => void;
	updateFolder: (id: string, f: Partial<Folder>) => void;
	removeFolder: (id: string) => void;
};

const initialSettings: StoreType["settings"] = {
	common: {
		pathAliases: [],
		defaultIDE: "vscode",
		defaultConsole: "powershell",
		taskTrackerUrl: "",
	},
	git: {
		gitSynch: false,
		gitProvider: "gitlab",
		url: "",
	},
};

export const useAppStore = create<AppStore>((set) => ({
	hydrated: false,
	loadError: null,

	settings: initialSettings,
	projects: [],
	folders: [],

	// --- LOAD ---
	load: async () => {
		set({ loadError: null });

		try {
			const state = await window.api.app.get();

			set({
				settings: state.settings,
				projects: state.projects,
				folders: state.folders,
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
