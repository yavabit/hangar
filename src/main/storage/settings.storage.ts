import { store } from "./store";
import { ProjectsStorage } from "./projects.storage";
import { renameAliasInPath, resolveAliasPath } from "../../shared/utils/pathAliases";
import { withDefaultSettings, type AppSettings } from "../../shared/schemas/store.schema";

type PathAliases = NonNullable<AppSettings["common"]["pathAliases"]>;

export class SettingsStorage {
	static get(): AppSettings {
		return withDefaultSettings(store.get("settings"));
	}

	static getAliases(): PathAliases {
		return this.get().common.pathAliases ?? [];
	}

	static save(settings: AppSettings): AppSettings {
		const prev = this.get();
		const next = withDefaultSettings(settings);

		this.syncProjectsWithAliases(prev.common.pathAliases ?? [], next.common.pathAliases ?? []);
		store.set("settings", next);

		return next;
	}

	/**
	 * Проекты ссылаются на алиас по имени. При переименовании алиаса пути проектов
	 * переписываются на новое имя, а при удалении — разворачиваются в полные пути.
	 */
	private static syncProjectsWithAliases(prevAliases: PathAliases, nextAliases: PathAliases): void {
		const nextById = new Map(nextAliases.map((alias) => [alias.id, alias]));

		const projects = ProjectsStorage.getAll();
		let changed = false;

		const updated = projects.map((project) => {
			let path = project.path;

			for (const prevAlias of prevAliases) {
				const nextAlias = nextById.get(prevAlias.id);

				if (!nextAlias) {
					path = resolveAliasPath(path, [prevAlias]);
				} else if (nextAlias.alias !== prevAlias.alias) {
					path = renameAliasInPath(path, prevAlias.alias, nextAlias.alias);
				}
			}

			if (path !== project.path) {
				changed = true;
				return { ...project, path };
			}
			return project;
		});

		if (changed) {
			ProjectsStorage.setAll(updated);
		}
	}
}
