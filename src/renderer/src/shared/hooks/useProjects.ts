import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "./useAppNotification";
import { projectsApi } from "../api/projects.api";
import { Project } from "@schemas/store.schema";

type UseProjectType = {
	projects: Project[];
	addProject: (project) => Promise<void>;
	updateProject: (id, patch) => Promise<void>;
	removeProject: (id) => Promise<void>;
	openProjectFolder: (id: string) => Promise<void>;
	openProjectInIde: (id: string) => Promise<void>;
}

export const useProjects = (): UseProjectType => {
	const projects = useAppStore((s) => s.projects);
	const addLocal = useAppStore((s) => s.addProject);
	const updateLocal = useAppStore((s) => s.updateProject);
	const removeLocal = useAppStore((s) => s.removeProject);

	const { showSuccess, showError } = useAppNotification();

	const addProject = async (project): Promise<void> => {
		try {
			const newProject = await projectsApi.add(project);
			addLocal(newProject);

			showSuccess("project_add", {
				message: "Проект добавлен",
			});
		} catch (e) {
			showError("project_add", {
				message: "Ошибка добавления проекта",
			});
			throw e;
		}
	};

	const updateProject = async (id, patch): Promise<void> => {
		const prev = projects;

		try {
			const updatedProject = await projectsApi.update(id, patch);
			updateLocal(id, updatedProject);

			showSuccess("project_update", {
				message: "Проект обновлён",
			});
		} catch (e) {
			showError("project_update", {
				message: "Ошибка обновления",
			});

			useAppStore.setState({ projects: prev });

			throw e;
		}
	};

	const removeProject = async (id): Promise<void> => {
		const prev = projects;

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

	const openProjectFolder = async (id: string): Promise<void> => {
		const project = projects.find((p) => p.id === id);
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
			});
		} catch (e) {
			showError("project_open_folder", {
				message: "Не удалось открыть папку проекта",
			});
			throw e;
		}
	};

	const openProjectInIde = async (id: string): Promise<void> => {
		const project = projects.find((p) => p.id === id);
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
			});
		} catch (e) {
			showError("project_open_ide", {
				message: "Не удалось открыть проект в IDE",
			});
			throw e;
		}
	};

	return {
		projects,
		addProject,
		updateProject,
		removeProject,
		openProjectFolder,
		openProjectInIde,
	};
};
