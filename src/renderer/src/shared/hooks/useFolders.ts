import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "./useAppNotification";
import { foldersApi } from "../api/folders.api";
import { Folder } from "@schemas/store.schema";

export type FolderInput = Omit<Folder, "id">;

type UseFolderType = {
	folders: Folder[];
	addFolder: (folder: FolderInput) => Promise<void>;
	updateFolder: (id: Folder["id"], patch: Partial<Folder>) => Promise<void>;
	removeFolder: (id: Folder["id"], deleteFolderProjects: boolean) => Promise<void>;
};

export const useFolders = (): UseFolderType => {
	const folders = useAppStore((s) => s.folders);

	const addLocal = useAppStore((s) => s.addFolder);
	const updateLocal = useAppStore((s) => s.updateFolder);
	const removeLocal = useAppStore((s) => s.removeFolder);
	const setProjects = useAppStore((s) => s.setProjects);

	const { showSuccess, showError } = useAppNotification();

	const addFolder = async (folder: FolderInput): Promise<void> => {
		try {
			const newFolder = await foldersApi.add(folder);
			addLocal(newFolder);

			showSuccess("folder_add", { message: "Папка добавлена", description: newFolder.name });
		} catch(e) {
			showError("folder_add", { message: "Ошибка добавления папки" });
			console.log(e)
		}
	};

	const updateFolder = async (id: Folder["id"], patch: Partial<Folder>): Promise<void> => {
		const prev = useAppStore.getState().folders;

		updateLocal(id, patch);

		try {
			await foldersApi.update(id, patch);
			showSuccess("folder_update", { message: "Папка обновлена" });
		} catch {
			useAppStore.setState({ folders: prev });

			showError("folder_update", { message: "Ошибка обновления" });
		}
	};

	const removeFolder = async (id: Folder["id"], deleteFolderProjects: boolean): Promise<void> => {
		const prev = useAppStore.getState().folders;

		removeLocal(id);

		try {
			const projects = await foldersApi.remove(id, deleteFolderProjects);
			setProjects(projects);

			showSuccess("folder_remove", {
				message: "Папка удалена",
				description: deleteFolderProjects
					? "Проекты из папки тоже удалены"
					: "Проекты из папки перенесены в общий список",
			});
		} catch {
			useAppStore.setState({ folders: prev });

			showError("folder_remove", { message: "Ошибка удаления" });
		}
	};

	return {
		folders,
		addFolder,
		updateFolder,
		removeFolder,
	};
};
