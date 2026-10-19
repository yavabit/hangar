import { useMemo } from "react";
import type { Folder, Project } from "@schemas/store.schema";
import {
	canCreateIn,
	canMoveFolder,
	formatFolderPath,
	getChildFolders,
	getFolderDepth,
	getFolderPath,
	getProjectsInTree,
	MAX_FOLDER_DEPTH,
} from "@common/utils/folderTree";
import { useAppStore } from "@renderer/store/app.store";

export type FolderTreeNode = {
	value: string;
	title: string;
	disabled?: boolean;
	children?: FolderTreeNode[];
};

const byName = (a: Folder, b: Folder): number => a.name.localeCompare(b.name, "ru", { sensitivity: "base" });

export type FolderTree = {
	folders: Folder[];
	/** Подпапки по алфавиту. Без parentId — папки верхнего уровня */
	childrenOf: (parentId: string | undefined) => Folder[];
	pathOf: (id: string | undefined) => Folder[];
	/** «Работа / Заказчик 1» */
	pathLabel: (id: string | undefined) => string;
	depthOf: (id: string | undefined) => number;
	/** Проекты папки вместе с вложенными */
	projectsIn: (id: string) => Project[];
	canCreateIn: (parentId: string | undefined) => boolean;
	canMove: (id: string, parentId: string | undefined) => boolean;
	/** Дерево для TreeSelect; isDisabled помечает папки, которые выбрать нельзя */
	toTreeData: (isDisabled?: (folder: Folder) => boolean) => FolderTreeNode[];
};

export { MAX_FOLDER_DEPTH };

export const useFolderTree = (): FolderTree => {
	const folders = useAppStore((s) => s.folders);
	const projects = useAppStore((s) => s.projects);

	return useMemo(() => {
		const childrenOf = (parentId: string | undefined): Folder[] => getChildFolders(folders, parentId).sort(byName);

		const toTreeData = (isDisabled?: (folder: Folder) => boolean): FolderTreeNode[] => {
			const build = (parentId: string | undefined, seen: Set<string>): FolderTreeNode[] =>
				childrenOf(parentId)
					.filter((folder) => !seen.has(folder.id))
					.map((folder) => {
						const children = build(folder.id, new Set([...seen, folder.id]));
						return {
							value: folder.id,
							title: folder.name,
							disabled: isDisabled?.(folder),
							children: children.length ? children : undefined,
						};
					});
			return build(undefined, new Set());
		};

		return {
			folders,
			childrenOf,
			pathOf: (id) => getFolderPath(folders, id),
			pathLabel: (id) => formatFolderPath(folders, id),
			depthOf: (id) => getFolderDepth(folders, id),
			projectsIn: (id) => getProjectsInTree(folders, projects, id),
			canCreateIn: (parentId) => canCreateIn(folders, parentId),
			canMove: (id, parentId) => canMoveFolder(folders, id, parentId),
			toTreeData,
		};
	}, [folders, projects]);
};
