import type { Folder, Project } from "@schemas/store.schema";

/** opened — недавно открытые из лаунчера, modified — недавно изменённые файлы */
export type ProjectSort = "opened" | "modified" | "name";

export type ProjectFiltersValue = {
	search: string;
	sort: ProjectSort;
};

const normalize = (value?: string): string => value?.trim().toLowerCase() ?? "";

const getTime = (timestamp?: string): number => {
	if (!timestamp) {
		return 0;
	}
	const time = new Date(timestamp).getTime();
	return Number.isNaN(time) ? 0 : time;
};

/**
 * @param resolvePath полный путь проекта: искать можно и по алиасу, и по реальному пути
 */
export const matchesProject = (project: Project, search: string, resolvePath?: (path: string) => string): boolean => {
	const query = normalize(search);
	if (!query) {
		return true;
	}

	return [project.name, project.description, project.path, resolvePath?.(project.path), project.gitUrl].some((field) =>
		normalize(field).includes(query),
	);
};

export const matchesFolder = (folder: Folder, search: string): boolean => {
	const query = normalize(search);
	if (!query) {
		return true;
	}

	return [folder.name, folder.description].some((field) => normalize(field).includes(query));
};

const byName = (a: Project, b: Project): number => a.name.localeCompare(b.name, "ru", { sensitivity: "base" });

export const sortProjects = (projects: Project[], sort: ProjectSort): Project[] => {
	const sorted = [...projects];

	switch (sort) {
		case "name":
			return sorted.sort(byName);
		case "modified":
			return sorted.sort((a, b) => getTime(b.lastModified) - getTime(a.lastModified));
		case "opened":
			return sorted.sort(
				(a, b) =>
					getTime(b.lastOpenedAt) - getTime(a.lastOpenedAt) ||
					getTime(b.lastModified) - getTime(a.lastModified),
			);
	}
};

export const applyProjectFilters = (
	projects: Project[],
	filters: ProjectFiltersValue,
	resolvePath?: (path: string) => string,
): Project[] => {
	return sortProjects(
		projects.filter((project) => matchesProject(project, filters.search, resolvePath)),
		filters.sort,
	);
};

/** Самая свежая дата изменения среди проектов (для карточки папки) */
export const getLatestActivity = (projects: Project[]): string | undefined => {
	return sortProjects(projects, "modified")[0]?.lastModified;
};
