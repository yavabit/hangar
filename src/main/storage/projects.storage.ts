import { store } from "./store";

import type { Project } from "../../shared/schemas/store.schema";

export class ProjectsStorage {
	static getAll(): Project[] {
		return store.get("projects");
	}

	static getById(id: string): Project | undefined {
		return this.getAll().find((project) => project.id === id);
	}

	static setAll(projects: Project[]): void {
		store.set("projects", projects);
	}

	static add(project: Omit<Project, "id">): Project {
		return this.addMany([project])[0];
	}

	static addMany(items: Omit<Project, "id">[]): Project[] {
		const created = items.map((project) => ({ ...project, id: crypto.randomUUID() }));

		store.set("projects", [...store.get("projects"), ...created]);

		return created;
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

	static removeByFolder(folderId: string): void {
		const projects = store.get("projects").filter((p) => p.folderId !== folderId);

		store.set("projects", projects);
	}

	static detachFromFolder(folderId: string): void {
		const projects = store
			.get("projects")
			.map((p) => (p.folderId === folderId ? { ...p, folderId: undefined } : p));

		store.set("projects", projects);
	}
}
