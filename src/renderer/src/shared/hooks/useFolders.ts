import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "./useAppNotification";
import { foldersApi } from "../api/folders.api";
import { Folder } from "@schemas/store.schema";
import { getIpcErrorMessage } from "../utils/ipcError";
import { pluralize } from "../utils/pluralize";

export type FolderInput = Omit<Folder, "id">;

type UseFolderType = {
	folders: Folder[];
	addFolder: (folder: FolderInput) => Promise<void>;
	updateFolder: (id: Folder["id"], patch: Partial<Folder>) => Promise<void>;
	/** deleteContents — удалить вложенные папки и проекты, иначе они переедут на уровень выше */
	removeFolder: (id: Folder["id"], deleteContents: boolean) => Promise<void>;
	/** Перенос папки внутрь другой или, без parentId, на верхний уровень */
	moveFolder: (id: Folder["id"], parentId: Folder["id"] | undefined) => Promise<void>;
	openFolderInIde: (id: Folder["id"]) => Promise<void>;
};

export const useFolders = (): UseFolderType => {
	const folders = useAppStore((s) => s.folders);

	const addLocal = useAppStore((s) => s.addFolder);
	const updateLocal = useAppStore((s) => s.updateFolder);
	const removeLocal = useAppStore((s) => s.removeFolder);
	const setProjects = useAppStore((s) => s.setProjects);
	const setFolders = useAppStore((s) => s.setFolders);

	const { showSuccess, showError } = useAppNotification();

	const addFolder = async (folder: FolderInput): Promise<void> => {
		try {
			const newFolder = await foldersApi.add(folder);
			addLocal(newFolder);

			showSuccess("folder_add", { message: "Папка добавлена", description: newFolder.name });
		} catch (e) {
			showError("folder_add", { message: "Ошибка добавления папки", description: getIpcErrorMessage(e) });
		}
	};

	const updateFolder = async (id: Folder["id"], patch: Partial<Folder>): Promise<void> => {
		const prev = useAppStore.getState().folders;

		updateLocal(id, patch);

		try {
			await foldersApi.update(id, patch);
			showSuccess("folder_update", { message: "Папка обновлена" });
		} catch (e) {
			useAppStore.setState({ folders: prev });

			showError("folder_update", { message: "Ошибка обновления", description: getIpcErrorMessage(e) });
		}
	};

	const removeFolder = async (id: Folder["id"], deleteContents: boolean): Promise<void> => {
		const prev = useAppStore.getState().folders;

		removeLocal(id);

		try {
			const result = await foldersApi.remove(id, deleteContents);
			setFolders(result.folders);
			setProjects(result.projects);

			showSuccess("folder_remove", {
				message: "Папка удалена",
				description: deleteContents ? "Вложенные папки и проекты тоже удалены" : "Содержимое перенесено на уровень выше",
			});
		} catch (e) {
			useAppStore.setState({ folders: prev });

			showError("folder_remove", { message: "Ошибка удаления", description: getIpcErrorMessage(e) });
		}
	};

	const moveFolder = async (id: Folder["id"], parentId: Folder["id"] | undefined): Promise<void> => {
		const folder = useAppStore.getState().folders.find((f) => f.id === id);
		if (!folder || folder.parentId === parentId) {
			return;
		}

		const prev = useAppStore.getState().folders;
		updateLocal(id, { parentId });

		try {
			await foldersApi.update(id, { parentId });
			const target = prev.find((f) => f.id === parentId);
			showSuccess("folder_move", {
				message: target ? `Перемещено в «${target.name}»` : "Перемещено на верхний уровень",
				description: folder.name,
				duration: 2,
			});
		} catch (e) {
			useAppStore.setState({ folders: prev });
			showError("folder_move", { message: "Не удалось переместить папку", description: getIpcErrorMessage(e) });
		}
	};

	const openFolderInIde = async (id: Folder["id"]): Promise<void> => {
		try {
			const { opened, skipped } = await foldersApi.openInIde(id);
			showSuccess("folder_open", {
				message: `Открыто ${opened} ${pluralize(opened, ["проект", "проекта", "проектов"])}`,
				description: skipped ? `Не найдено на диске: ${skipped}` : undefined,
				duration: 3,
			});
		} catch (e) {
			showError("folder_open", { message: "Не удалось открыть папку в IDE", description: getIpcErrorMessage(e) });
		}
	};

	return {
		folders,
		addFolder,
		updateFolder,
		removeFolder,
		moveFolder,
		openFolderInIde,
	};
};
