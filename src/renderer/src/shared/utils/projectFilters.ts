import type { Folder, Project } from "@schemas/store.schema";

export type ProjectSort = "recent" | "name";

export type ProjectFiltersValue = {
	search: string;
	sort: ProjectSort;
};

export const DEFAULT_PROJECT_FILTERS: ProjectFiltersValue = {
	search: "",
	sort: "recent",
};

const normalize = (value?: string): string => value?.trim().toLowerCase() ?? "";

const getTime = (timestamp: string): number => {
	const time = new Date(timestamp).getTime();
	return Number.isNaN(time) ? 0 : time;
};

export const matchesProject = (project: Project, search: string): boolean => {
	const query = normalize(search);
	if (!query) {
		return true;
	}

	return [project.name, project.path, project.gitUrl].some((field) => normalize(field).includes(query));
};

export const matchesFolder = (folder: Folder, search: string): boolean => {
	const query = normalize(search);
	if (!query) {
		return true;
	}

	return [folder.name, folder.description].some((field) => normalize(field).includes(query));
};

export const sortProjects = (projects: Project[], sort: ProjectSort): Project[] => {
	const sorted = [...projects];

	if (sort === "name") {
		return sorted.sort((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: "base" }));
	}

	return sorted.sort((a, b) => getTime(b.lastOpened) - getTime(a.lastOpened));
};

export const applyProjectFilters = (projects: Project[], filters: ProjectFiltersValue): Project[] => {
	return sortProjects(
		projects.filter((project) => matchesProject(project, filters.search)),
		filters.sort,
	);
};

export const getLatestActivity = (projects: Project[]): string | undefined => {
	return sortProjects(projects, "recent")[0]?.lastOpened;
};
