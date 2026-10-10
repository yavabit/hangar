import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "./useAppNotification";
import { projectsApi } from "../api/projects.api";
import { Project } from "@schemas/store.schema";

export type ProjectInput = Omit<Project, "id" | "lastOpened"> & Partial<Pick<Project, "lastOpened">>;

type UseProjectType = {
	projects: Project[];
	addProject: (project: ProjectInput) => Promise<void>;
	updateProject: (id: Project["id"], patch: Partial<Project>) => Promise<void>;
	removeProject: (id: Project["id"]) => Promise<void>;
	toggleFavorite: (id: Project["id"]) => Promise<void>;
	openProjectFolder: (id: Project["id"]) => Promise<void>;
	openProjectInIde: (id: Project["id"]) => Promise<void>;
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
			const newProject = await projectsApi.add({
				...project,
				lastOpened: project.lastOpened ?? new Date().toISOString(),
			});
			addLocal(newProject);

			showSuccess("project_add", {
				message: "Проект добавлен",
				description: newProject.name,
			});
		} catch (e) {
			showError("project_add", {
				message: "Ошибка добавления проекта",
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
			});

			throw e;
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
		const project = findProject(id);
		if (!project) {
			showError("project_open_folder", {
				message: "Проект не найден",
			});
			return;
		}

		try {
			await projectsApi.openFolder(project.path);
			showSuccess("project_open_folder", {
				message: "Папка проекта открыта",
				duration: 2,
			});
		} catch (e) {
			showError("project_open_folder", {
				message: "Не удалось открыть папку проекта",
				description: project.path,
			});
			throw e;
		}
	};

	const openProjectInIde = async (id: Project["id"]): Promise<void> => {
		const project = findProject(id);
		if (!project) {
			showError("project_open_ide", {
				message: "Проект не найден",
			});
			return;
		}

		try {
			await projectsApi.openInIde(project.path);
			showSuccess("project_open_ide", {
				message: "Проект открыт в IDE",
				description: project.name,
				duration: 2,
			});
		} catch (e) {
			showError("project_open_ide", {
				message: "Не удалось открыть проект в IDE",
				description: "Проверьте IDE по умолчанию в настройках",
			});
			throw e;
		}
	};

	return {
		projects,
		addProject,
		updateProject,
		removeProject,
		toggleFavorite,
		openProjectFolder,
		openProjectInIde,
	};
};
