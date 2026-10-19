import { useAppStore } from "@renderer/store/app.store";
import { useUiStore } from "@renderer/store/ui.store";
import { useAppNotification } from "./useAppNotification";
import { projectsApi } from "../api/projects.api";
import { getIpcErrorMessage } from "../utils/ipcError";
import { pluralize } from "../utils/pluralize";
import { Folder, Project } from "@schemas/store.schema";
import type { ImportItem, ImportOptions, NewProject } from "@common/api/api.types";

export type ProjectInput = NewProject;

type UseProjectType = {
	projects: Project[];
	addProject: (project: ProjectInput) => Promise<void>;
	/** Добавляет найденные при импорте проекты; папки по структуре на диске создаёт main */
	importProjects: (items: ImportItem[], options: ImportOptions) => Promise<void>;
	updateProject: (id: Project["id"], patch: Partial<Project>) => Promise<void>;
	moveProject: (id: Project["id"], folder: Folder | null) => Promise<void>;
	removeProject: (id: Project["id"]) => Promise<void>;
	toggleFavorite: (id: Project["id"]) => Promise<void>;
	openProjectFolder: (id: Project["id"]) => Promise<void>;
	openProjectInIde: (id: Project["id"]) => Promise<void>;
	openProjectTerminal: (id: Project["id"]) => Promise<void>;
}

export const useProjects = (): UseProjectType => {
	const projects = useAppStore((s) => s.projects);
	const addLocal = useAppStore((s) => s.addProject);
	const updateLocal = useAppStore((s) => s.updateProject);
	const removeLocal = useAppStore((s) => s.removeProject);

	const { showSuccess, showError } = useAppNotification();

	const findProject = (id: Project["id"]): Project | undefined => useAppStore.getState().projects.find((p) => p.id === id);

	const addProject = async (project: ProjectInput): Promise<void> => {
		try {
			const newProject = await projectsApi.add(project);
			addLocal(newProject);

			showSuccess("project_add", {
				message: "Проект добавлен",
				description: newProject.name,
			});
		} catch (e) {
			showError("project_add", {
				message: "Ошибка добавления проекта",
				description: getIpcErrorMessage(e),
			});
			throw e;
		}
	};

	const importProjects = async (items: ImportItem[], options: ImportOptions): Promise<void> => {
		try {
			const created = await projectsApi.import(items, options);
			useAppStore.setState((state) => ({ projects: [...state.projects, ...created] }));

			showSuccess("project_import", {
				message: `Добавлено ${created.length} ${pluralize(created.length, ["проект", "проекта", "проектов"])}`,
			});
		} catch (e) {
			showError("project_import", {
				message: "Ошибка импорта проектов",
				description: getIpcErrorMessage(e),
			});
			throw e;
		}
	};

	const updateProject = async (id: Project["id"], patch: Partial<Project>): Promise<void> => {
		const prev = useAppStore.getState().projects;

		updateLocal(id, patch);

		try {
			const updatedProject = await projectsApi.update(id, patch);
			updateLocal(id, updatedProject);

			showSuccess("project_update", {
				message: "Проект обновлён",
			});
		} catch (e) {
			useAppStore.setState({ projects: prev });

			showError("project_update", {
				message: "Ошибка обновления",
				description: getIpcErrorMessage(e),
			});

			throw e;
		}
	};

	const moveProject = async (id: Project["id"], folder: Folder | null): Promise<void> => {
		const project = findProject(id);
		if (!project || (project.folderId ?? null) === (folder?.id ?? null)) {
			return;
		}

		updateLocal(id, { folderId: folder?.id });

		try {
			await projectsApi.update(id, { folderId: folder?.id });

			showSuccess("project_move", {
				message: folder ? `Перемещено в «${folder.name}»` : "Убрано из папки",
				description: project.name,
				duration: 2,
			});
		} catch (e) {
			updateLocal(id, { folderId: project.folderId });

			showError("project_move", {
				message: "Не удалось переместить проект",
				description: getIpcErrorMessage(e),
			});
		}
	};

	const toggleFavorite = async (id: Project["id"]): Promise<void> => {
		const project = findProject(id);
		if (!project) {
			return;
		}

		const isFavorite = !project.isFavorite;

		updateLocal(id, { isFavorite });

		try {
			await projectsApi.update(id, { isFavorite });

			showSuccess("project_favorite", {
				message: isFavorite ? "Добавлено в избранное" : "Удалено из избранного",
				description: project.name,
				duration: 2,
			});
		} catch (e) {
			updateLocal(id, { isFavorite: project.isFavorite });

			showError("project_favorite", {
				message: "Не удалось изменить избранное",
			});

			throw e;
		}
	};

	const removeProject = async (id: Project["id"]): Promise<void> => {
		const prev = useAppStore.getState().projects;

		removeLocal(id);

		try {
			await projectsApi.remove(id);

			showSuccess("project_remove", {
				message: "Проект удалён",
			});
		} catch (e) {
			useAppStore.setState({ projects: prev });

			showError("project_remove", {
				message: "Ошибка удаления",
			});

			throw e;
		}
	};

	const openProjectFolder = async (id: Project["id"]): Promise<void> => {
		try {
			await projectsApi.openFolder(id);
			showSuccess("project_open_folder", {
				message: "Папка проекта открыта",
				description: findProject(id)?.name,
				duration: 2,
			});
		} catch (e) {
			showError("project_open_folder", {
				message: "Не удалось открыть папку проекта",
				description: getIpcErrorMessage(e),
			});
		}
	};

	const openProjectInIde = async (id: Project["id"]): Promise<void> => {
		useUiStore.getState().markLaunching(id);
		try {
			const updated = await projectsApi.openInIde(id);
			updateLocal(id, updated);
			showSuccess("project_open_ide", {
				message: "Проект открыт в IDE",
				description: updated.name,
				duration: 2,
			});
		} catch (e) {
			showError("project_open_ide", {
				message: "Не удалось открыть проект в IDE",
				description: getIpcErrorMessage(e),
			});
		}
	};

	const openProjectTerminal = async (id: Project["id"]): Promise<void> => {
		try {
			await projectsApi.openTerminal(id);
		} catch (e) {
			showError("project_open_terminal", {
				message: "Не удалось открыть терминал",
				description: getIpcErrorMessage(e),
			});
		}
	};

	return {
		projects,
		addProject,
		importProjects,
		updateProject,
		moveProject,
		removeProject,
		toggleFavorite,
		openProjectFolder,
		openProjectInIde,
		openProjectTerminal,
	};
};
