import { shell } from "electron";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import { basename, join } from "path";
import { Project } from "../../shared/schemas/store.schema";
import type { PathInfo, ScanCandidate } from "../../shared/api/api.types";
import { resolveAliasPath, toAliasPath } from "../../shared/utils/pathAliases";
import { ProjectsStorage } from "../storage/projects.storage";
import { SettingsStorage } from "../storage/settings.storage";

export type IdeType = "vscode" | "webstorm" | "intellij";

const IGNORED_DIRS = new Set([
	"node_modules",
	".git",
	".svn",
	".hg",
	".idea",
	".next",
	".nuxt",
	".turbo",
	".cache",
	".gradle",
	"dist",
	"build",
	"out",
	"target",
	"coverage",
	"vendor",
	"bin",
	"obj",
	"__pycache__",
	".venv",
	"venv",
]);

/** Файлы, по которым папка без git считается проектом при импорте */
const PROJECT_MARKERS = [
	"package.json",
	"pyproject.toml",
	"requirements.txt",
	"go.mod",
	"Cargo.toml",
	"pom.xml",
	"build.gradle",
	"build.gradle.kts",
	"composer.json",
	"Gemfile",
];

const MAX_SCAN_RESULTS = 500;

export class ProjectService {
	/** Полный путь проекта с учётом алиасов из настроек */
	static resolvePath(path: string): string {
		return resolveAliasPath(path, SettingsStorage.getAliases());
	}

	static async isDirectory(path: string): Promise<boolean> {
		try {
			return (await fs.stat(path)).isDirectory();
		} catch {
			return false;
		}
	}

	private static async getExistingProjectPath(id: Project["id"]): Promise<{ project: Project; path: string }> {
		const project = ProjectsStorage.getById(id);
		if (!project) {
			throw new Error("Проект не найден");
		}

		const path = this.resolvePath(project.path);
		if (!(await this.isDirectory(path))) {
			throw new Error(`Папка не найдена: ${path}`);
		}

		return { project, path };
	}

	static async openProjectFolder(id: Project["id"]): Promise<Project> {
		const { project, path } = await this.getExistingProjectPath(id);
		await this.openFolder(path);
		return project;
	}

	/** Открывает проект в IDE из настроек и запоминает время открытия */
	static async openProjectInIde(id: Project["id"]): Promise<Project> {
		const { path } = await this.getExistingProjectPath(id);
		await this.openInIde(path, SettingsStorage.get().common.defaultIDE);
		return ProjectsStorage.update(id, { lastOpenedAt: new Date().toISOString() });
	}

	static async openFolder(projectPath: string): Promise<void> {
		const error = await shell.openPath(projectPath);

		if (error) {
			throw new Error(`Не удалось открыть папку: ${error}`);
		}
	}

	static async openInIde(projectPath: string, ide: IdeType): Promise<void> {
		switch (ide) {
			case "vscode":
				return this.openInVsCode(projectPath);
			case "webstorm":
				return this.openInWebStorm(projectPath);
			case "intellij":
				return this.openInIntelliJ(projectPath);
			default:
				throw new Error(`Неизвестная IDE: ${ide}`);
		}
	}

	private static async openInVsCode(projectPath: string): Promise<void> {
		const cliCommands = ["code", "code.cmd"];
		const args = ["--new-window", projectPath];

		for (const command of cliCommands) {
			try {
				return await this.runCommand(command, args);
			} catch (error) {
				const err = error as NodeJS.ErrnoException;
				if (err?.code !== "ENOENT") {
					throw err;
				}
			}
		}

		const url = encodeURI(`vscode://file/${projectPath.replace(/\\/g, "/")}`);
		await shell.openExternal(url);
	}

	private static async openInWebStorm(projectPath: string): Promise<void> {
		const commandOptions = process.platform === "darwin"
			? [
				{ command: "wstorm", args: [projectPath] },
				{ command: "webstorm", args: [projectPath] },
				{ command: "open", args: ["-n", "-a", "WebStorm", "--args", projectPath] },
			]
			: [
				{ command: "webstorm", args: [projectPath] },
				{ command: "wstorm", args: [projectPath] },
				{ command: "webstorm.cmd", args: [projectPath] },
			];

		for (const option of commandOptions) {
			try {
				return await this.runCommand(option.command, option.args);
			} catch (error) {
				const err = error as NodeJS.ErrnoException;
				if (err?.code !== "ENOENT") {
					throw err;
				}
			}
		}

		const url = encodeURI(`webstorm://open?file=${projectPath.replace(/\\/g, "/")}`);
		await shell.openExternal(url);
	}

	private static async openInIntelliJ(projectPath: string): Promise<void> {
		const commandOptions = process.platform === "darwin"
			? [
				{ command: "idea", args: [projectPath] },
				{ command: "open", args: ["-n", "-a", "IntelliJ IDEA", "--args", projectPath] },
			]
			: [
				{ command: "idea64", args: [projectPath] },
				{ command: "idea", args: [projectPath] },
				{ command: "idea.sh", args: [projectPath] },
			];

		for (const option of commandOptions) {
			try {
				return await this.runCommand(option.command, option.args);
			} catch (error) {
				const err = error as NodeJS.ErrnoException;
				if (err?.code !== "ENOENT") {
					throw err;
				}
			}
		}

		const url = encodeURI(`idea://open?file=${projectPath.replace(/\\/g, "/")}`);
		await shell.openExternal(url);
	}

	private static async runCommand(command: string, args: string[]): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			const options = {
				windowsHide: true,
				shell: false,
			};

			const child = process.platform === "win32" && /\.(cmd|bat)$/i.test(command)
				? spawn("cmd.exe", ["/c", command, ...args], options)
				: spawn(command, args, options);

			child.on("error", reject);
			child.on("exit", (code, signal) => {
				if (code && code !== 0) {
					reject(new Error(`Command failed: ${command} ${args.map((a) => JSON.stringify(a)).join(" ")} (code ${code})`));
					return;
				}
				if (signal) {
					reject(new Error(`Command killed by signal: ${signal}`));
					return;
				}
				resolve();
			});
		});
	}

	static async inspectPath(projectPath: string): Promise<PathInfo> {
		const resolvedPath = this.resolvePath(projectPath);
		const exists = await this.isDirectory(resolvedPath);

		return {
			name: basename(resolvedPath),
			gitUrl: exists ? await this.getGitRemoteUrl(resolvedPath) : undefined,
			resolvedPath,
			exists,
		};
	}

	private static async getGitRemoteUrl(projectPath: string): Promise<string | undefined> {
		let config: string;
		try {
			config = await fs.readFile(join(projectPath, ".git", "config"), "utf8");
		} catch {
			return undefined;
		}

		const remotes = [...config.matchAll(/\[remote "([^"]+)"\]([^[]*)/g)].map((match) => ({
			name: match[1],
			url: /^\s*url\s*=\s*(.+?)\s*$/m.exec(match[2])?.[1],
		}));

		const origin = remotes.find((remote) => remote.name === "origin" && remote.url);
		return origin?.url ?? remotes.find((remote) => remote.url)?.url;
	}

	/**
	 * Ищет проекты внутри папки: каталоги с .git или файлом-маркером (package.json и т.п.).
	 * Внутрь найденного проекта поиск не заходит.
	 */
	static async scanForProjects(rootPath: string, maxDepth: number): Promise<ScanCandidate[]> {
		const results: ScanCandidate[] = [];
		const aliases = SettingsStorage.getAliases();
		let level = [rootPath];

		for (let depth = 0; depth <= maxDepth && level.length && results.length < MAX_SCAN_RESULTS; depth++) {
			const nextLevel: string[] = [];

			for (const dir of level) {
				let entries;
				try {
					entries = await fs.readdir(dir, { withFileTypes: true });
				} catch {
					continue;
				}

				const names = new Set(entries.map((entry) => entry.name));
				const hasGit = names.has(".git");
				const isProject = depth > 0 && (hasGit || PROJECT_MARKERS.some((marker) => names.has(marker)));

				if (isProject) {
					results.push({
						path: toAliasPath(dir, aliases) ?? dir,
						name: basename(dir),
						gitUrl: hasGit ? await this.getGitRemoteUrl(dir) : undefined,
						hasGit,
					});
					continue;
				}

				for (const entry of entries) {
					if (entry.isDirectory() && !entry.name.startsWith(".") && !IGNORED_DIRS.has(entry.name)) {
						nextLevel.push(join(dir, entry.name));
					}
				}
			}

			level = nextLevel;
		}

		return results.sort((a, b) => a.path.localeCompare(b.path));
	}

	/** Перевод полных путей проектов внутри папки алиаса на сам алиас */
	static applyAlias(aliasId: string): number {
		const aliases = SettingsStorage.getAliases();
		const alias = aliases.find((a) => a.id === aliasId);
		if (!alias) {
			throw new Error("Алиас не найден. Сохраните настройки и попробуйте снова");
		}

		let count = 0;
		const projects = ProjectsStorage.getAll().map((project) => {
			const aliased = toAliasPath(project.path, [alias]);
			if (!aliased) {
				return project;
			}
			count++;
			return { ...project, path: aliased };
		});

		if (count) {
			ProjectsStorage.setAll(projects);
		}
		return count;
	}

	static async refreshProjectLastModified(id: Project["id"]): Promise<void> {
		const project = ProjectsStorage.getById(id);
		if (!project) {
			return;
		}

		const latestDate = await this.getLatestFileModifiedDate(this.resolvePath(project.path));
		if (latestDate) {
			ProjectsStorage.update(id, { lastModified: latestDate.toISOString() });
		}
	}

	static async refreshLastModifiedTimestamps(): Promise<void> {
		for (const project of ProjectsStorage.getAll()) {
			const latestDate = await this.getLatestFileModifiedDate(this.resolvePath(project.path));
			if (!latestDate) {
				continue;
			}

			const latestIso = latestDate.toISOString();
			if (project.lastModified !== latestIso) {
				ProjectsStorage.update(project.id, { lastModified: latestIso });
			}
		}
	}

	private static async getLatestFileModifiedDate(projectPath: string): Promise<Date | null> {
		try {
			const stats = await fs.stat(projectPath);
			if (!stats.isDirectory()) {
				return stats.mtime ? new Date(stats.mtime) : null;
			}
		} catch {
			return null;
		}

		let latest: Date | null = null;
		const queue = [projectPath];

		while (queue.length) {
			const currentPath = queue.pop();
			if (!currentPath) {
				continue;
			}

			let entries;
			try {
				entries = await fs.readdir(currentPath, { withFileTypes: true });
			} catch {
				continue;
			}

			for (const entry of entries) {
				const entryPath = join(currentPath, entry.name);

				if (entry.isDirectory()) {
					if (!IGNORED_DIRS.has(entry.name)) {
						queue.push(entryPath);
					}
					continue;
				}

				if (!entry.isFile()) {
					continue;
				}

				try {
					const entryStats = await fs.stat(entryPath);
					const mtime = entryStats.mtime;
					if (!latest || mtime > latest) {
						latest = mtime;
					}
				} catch {
					continue;
				}
			}
		}

		return latest;
	}
}
