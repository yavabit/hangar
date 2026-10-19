import type { Folder, Project } from "../schemas/store.schema";

/** Папки вкладываются не глубже трёх уровней: «Работа → Заказчик → Продукт» */
export const MAX_FOLDER_DEPTH = 3;

type FolderLike = Pick<Folder, "id" | "parentId">;

const byId = <T extends FolderLike>(folders: readonly T[]): Map<string, T> => new Map(folders.map((f) => [f.id, f]));

/** Родитель папки. Папка с несуществующим родителем считается папкой верхнего уровня */
const getParentId = (folder: FolderLike, index: Map<string, FolderLike>): string | undefined =>
	folder.parentId && index.has(folder.parentId) ? folder.parentId : undefined;

/** Цепочка от папки верхнего уровня до указанной включительно */
export const getFolderPath = <T extends FolderLike>(folders: readonly T[], id: string | undefined): T[] => {
	const index = byId(folders);
	const path: T[] = [];
	const seen = new Set<string>();
	let current = id ? index.get(id) : undefined;

	while (current && !seen.has(current.id)) {
		seen.add(current.id);
		path.unshift(current);
		const parentId = getParentId(current, index);
		current = parentId ? index.get(parentId) : undefined;
	}

	return path;
};

/** Уровень папки: 1 — верхний. Для «без папки» — 0 */
export const getFolderDepth = (folders: readonly FolderLike[], id: string | undefined): number =>
	getFolderPath(folders, id).length;

export const getChildFolders = <T extends FolderLike>(folders: readonly T[], parentId: string | undefined): T[] => {
	const index = byId(folders);
	return folders.filter((folder) => getParentId(folder, index) === parentId);
};

/** Папка и все вложенные в неё */
export const getDescendantIds = (folders: readonly FolderLike[], id: string): Set<string> => {
	const result = new Set<string>([id]);
	let added = true;

	while (added) {
		added = false;
		for (const folder of folders) {
			if (folder.parentId && result.has(folder.parentId) && !result.has(folder.id)) {
				result.add(folder.id);
				added = true;
			}
		}
	}

	return result;
};

/** Сколько уровней занимает папка вместе с вложенными: 1 — подпапок нет */
export const getSubtreeHeight = (folders: readonly FolderLike[], id: string, seen = new Set<string>()): number => {
	seen.add(id);
	const children = folders.filter((folder) => folder.parentId === id && !seen.has(folder.id));
	return 1 + Math.max(0, ...children.map((child) => getSubtreeHeight(folders, child.id, seen)));
};

/** Можно ли создать папку внутри parentId */
export const canCreateIn = (folders: readonly FolderLike[], parentId: string | undefined): boolean =>
	getFolderDepth(folders, parentId) < MAX_FOLDER_DEPTH;

/** Можно ли перенести папку внутрь parentId: не в саму себя и не глубже трёх уровней */
export const canMoveFolder = (folders: readonly FolderLike[], id: string, parentId: string | undefined): boolean => {
	if (!parentId) {
		return true;
	}
	if (getDescendantIds(folders, id).has(parentId)) {
		return false;
	}
	return getFolderDepth(folders, parentId) + getSubtreeHeight(folders, id) <= MAX_FOLDER_DEPTH;
};

/** Проекты папки вместе с проектами вложенных папок */
export const getProjectsInTree = <P extends Pick<Project, "folderId">>(
	folders: readonly FolderLike[],
	projects: readonly P[],
	id: string,
): P[] => {
	const ids = getDescendantIds(folders, id);
	return projects.filter((project) => project.folderId && ids.has(project.folderId));
};

/** Адрес таск-трекера для проекта в папке: ближайший заданный в папке или её родителях, иначе из настроек */
export const resolveTaskTrackerUrl = (
	folders: readonly Pick<Folder, "id" | "parentId" | "taskTrackerUrl">[],
	folderId: string | undefined,
	defaultUrl: string,
): string => {
	const own = getFolderPath(folders, folderId)
		.reverse()
		.find((folder) => folder.taskTrackerUrl?.trim());
	return own?.taskTrackerUrl?.trim() ?? defaultUrl.trim();
};

export const formatFolderPath = (
	folders: readonly Pick<Folder, "id" | "parentId" | "name">[],
	id: string | undefined,
	separator = " / ",
): string =>
	getFolderPath(folders, id)
		.map((folder) => folder.name)
		.join(separator);
