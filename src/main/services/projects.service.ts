import { shell } from "electron";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";
import { Project } from "../../shared/schemas/store.schema";
import { ProjectsStorage } from "../storage/projects.storage";

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

export class ProjectService {
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

	static async refreshLastOpenedTimestamps(): Promise<Project[]> {
		const projects = ProjectsStorage.getAll();

		for (const project of projects) {
			const latestDate = await this.getLatestFileModifiedDate(project.path);
			if (!latestDate) {
				continue;
			}

			const latestIso = latestDate.toISOString();
			if (project.lastOpened !== latestIso) {
				ProjectsStorage.update(project.id, { lastOpened: latestIso });
			}
		}

		return ProjectsStorage.getAll();
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
