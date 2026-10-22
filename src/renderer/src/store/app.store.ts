import { create } from "zustand";
import { DEFAULT_SETTINGS, type AppSettings, type Folder, type Project } from "@schemas/store.schema";
import type { ProjectsHealth, UpdateStatus, WindowInfo } from "@common/api/api.types";

export type AppStore = {
	hydrated: boolean;
	loadError: string | null;

	settings: AppSettings;
	projects: Project[];
	folders: Folder[];
	/** Есть ли папка на диске и состояние git. Приходит из main, не сохраняется */
	health: ProjectsHealth;
	/** Когда статусы проверялись полностью */
	checkedAt: string | null;
	window: WindowInfo;
	version: string;
	packaged: boolean;
	update: UpdateStatus;

	load: () => Promise<void>;

	setSettings: (s: AppSettings) => void;

	setProjects: (p: Project[]) => void;
	addProjects: (p: Project[]) => void;
	addProject: (p: Project) => void;
	updateProject: (id: string, p: Partial<Project>) => void;
	removeProject: (id: string) => void;

	setHealth: (health: ProjectsHealth) => void;
	setCheckedAt: (checkedAt: string) => void;
	setUpdate: (update: UpdateStatus) => void;

	setFolders: (f: Folder[]) => void;
	addFolder: (f: Folder) => void;
	updateFolder: (id: string, f: Partial<Folder>) => void;
	removeFolder: (id: string) => void;
};

/**
 * Добавляет записи или заменяет уже существующие с тем же id. Main рассылает новый список
 * сразу при записи — он может прийти раньше ответа на запрос, и запись не должна задвоиться
 */
const upsertById = <T extends { id: string }>(list: T[], items: T[]): T[] => {
	const ids = new Set(items.map((item) => item.id));
	return [...list.filter((item) => !ids.has(item.id)), ...items];
};

export const useAppStore = create<AppStore>((set) => ({
	hydrated: false,
	loadError: null,

	settings: DEFAULT_SETTINGS,
	projects: [],
	folders: [],
	health: {},
	checkedAt: null,
	window: { platform: "win32", mica: false },
	version: "",
	packaged: false,
	update: { state: "idle", checkedAt: null, canInstall: false, releaseUrl: "" },

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
				checkedAt: state.checkedAt,
				window: state.window,
				version: state.version,
				packaged: state.packaged,
				update: state.update,
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
			projects: upsertById(state.projects, [project]),
		})),

	addProjects: (projects) =>
		set((state) => ({
			projects: upsertById(state.projects, projects),
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

	setCheckedAt: (checkedAt) => {
		set({ checkedAt });
	},

	setUpdate: (update) => {
		set({ update });
	},

	// --- FOLDERS ---
	setFolders: (folders) => {
		set({ folders });
	},

	addFolder: (folder) =>
		set((state) => ({
			folders: upsertById(state.folders, [folder]),
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
