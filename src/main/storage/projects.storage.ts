import { store } from "./store";

import type { Project } from "../../shared/schemas/store.schema";

export class ProjectsStorage {
	static getAll(): Project[] {
		return store.get("projects");
	}

	static add(project: Omit<Project, "id">): Project {
		const projects = store.get("projects");

		const newProject = { ...project, id: crypto.randomUUID() };

		projects.push(newProject);

		store.set("projects", projects);

		return newProject
	}

	static update(id: string, patch: Partial<Project>): Project {

		const projects = store.get("projects");

		const index = projects.findIndex((project) => project.id === id);

		if (index !== -1) {
			projects[index] = { ...projects[index], ...patch };
			store.set("projects", projects);
		}

		return projects[index]
	}

	static remove(id: string): void {
		const projects = store.get("projects").filter((p) => p.id !== id);

		store.set("projects", projects);
	}
}
