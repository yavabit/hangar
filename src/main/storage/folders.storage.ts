import { store } from "./store";

import type { Folder } from "../../shared/schemas/store.schema";
import { canCreateIn, canMoveFolder, getChildFolders, getDescendantIds, getFolderDepth, MAX_FOLDER_DEPTH } from "../../shared/utils/folderTree";

const DEPTH_ERROR = `Папки вкладываются не глубже ${MAX_FOLDER_DEPTH} уровней`;

const sameName = (a: string, b: string): boolean => a.trim().localeCompare(b.trim(), "ru", { sensitivity: "base" }) === 0;

export class FoldersStorage {
	static getAll(): Folder[] {
		return store.get("folders");
	}

	static getById(id: string): Folder | undefined {
		return store.get("folders").find((folder) => folder.id === id);
	}

	static add(folder: Omit<Folder, "id">): Folder {
		const folders = store.get("folders");

		if (!canCreateIn(folders, folder.parentId)) {
			throw new Error(DEPTH_ERROR);
		}

		const created = { ...folder, id: crypto.randomUUID() };
		store.set("folders", [...folders, created]);

		return created;
	}

	/** Папка с таким названием внутри parentId: существующая или новая */
	static ensure(name: string, parentId: string | undefined): Folder {
		const existing = getChildFolders(this.getAll(), parentId).find((folder) => sameName(folder.name, name));
		return existing ?? this.add({ name: name.trim(), parentId });
	}

	/**
	 * Цепочка вложенных папок по названиям внутри parentId, недостающие создаются.
	 * Если цепочка не помещается в три уровня, лишние уровни склеиваются в название последней папки.
	 * Возвращает id самой вложенной папки.
	 */
	static ensurePath(names: string[], parentId: string | undefined): string | undefined {
		const free = MAX_FOLDER_DEPTH - getFolderDepth(this.getAll(), parentId);
		if (free <= 0 || names.length === 0) {
			return parentId;
		}

		const chain = names.length > free ? [...names.slice(0, free - 1), names.slice(free - 1).join(" / ")] : names;

		let current = parentId;
		for (const name of chain) {
			current = this.ensure(name, current).id;
		}
		return current;
	}

	/**
	 * Удаляет папку. Вложенные папки и проекты либо удаляются вместе с ней,
	 * либо переезжают на уровень выше. Возвращает id удалённых папок.
	 */
	static remove(id: string, deleteContents: boolean): Set<string> {
		const folders = store.get("folders");
		const folder = folders.find((f) => f.id === id);
		const removed = deleteContents ? getDescendantIds(folders, id) : new Set([id]);

		store.set(
			"folders",
			folders
				.filter((f) => !removed.has(f.id))
				.map((f) => (f.parentId === id ? { ...f, parentId: folder?.parentId } : f)),
		);

		return removed;
	}

	static update(id: string, patch: Partial<Folder>): void {
		const folders = this.getAll();
		const index = folders.findIndex((folder) => folder.id === id);
		if (index === -1) {
			return;
		}

		if ("parentId" in patch && patch.parentId !== folders[index].parentId && !canMoveFolder(folders, id, patch.parentId)) {
			throw new Error(`Нельзя переместить папку: она окажется внутри себя или глубже ${MAX_FOLDER_DEPTH} уровней`);
		}

		folders[index] = { ...folders[index], ...patch };
		store.set("folders", folders);
	}
}
