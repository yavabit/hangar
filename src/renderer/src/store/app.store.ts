import { create } from "zustand";
import type { Folder, Project, StoreType } from "@schemas/store.schema";

export type AppStore = {
	hydrated: boolean;

	settings: StoreType["settings"];
	projects: StoreType["projects"];
	folders: StoreType["folders"];
	selectedFolder: Folder | null;

	load: () => Promise<void>;

	setSettings: (s: StoreType["settings"]) => void;

	setProjects: (p: StoreType["projects"]) => void;
	addProject: (p: Project) => void;
	updateProject: (id: string, p: Partial<Project>) => void;
	removeProject: (id: string) => void;

	setFolders: (f: StoreType["folders"]) => void;
	setSelectedFolder: (f: Folder | null) => void;
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

	settings: initialSettings,
	projects: [],
	filteredProjects: [],
	filteredFolders: [],
	folders: [],
	selectedFolder: null,

	// --- LOAD ---
	load: async () => {
		const state = await window.api.app.get();

		set({
			settings: state.settings,
			projects: state.projects,
			folders: state.folders,
			hydrated: true,
		});
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

	setSelectedFolder: (selectedFolder) => {
		set({ selectedFolder });
	},
}));
