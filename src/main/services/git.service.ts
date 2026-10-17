import { execFile } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";
import type { GitBranches, GitInfo } from "../../shared/api/api.types";

const GIT_TIMEOUT_MS = 10_000;
const SWITCH_TIMEOUT_MS = 60_000;

/**
 * Работа с локальным git: одна команда на проект и без сети.
 * «Позади» считается по данным последнего fetch, который делает сам пользователь.
 */
export class GitService {
	static async isRepository(projectPath: string): Promise<boolean> {
		try {
			await fs.access(join(projectPath, ".git"));
			return true;
		} catch {
			return false;
		}
	}

	static async getInfo(projectPath: string): Promise<GitInfo | null> {
		if (!(await this.isRepository(projectPath))) {
			return null;
		}

		try {
			const output = await this.run(projectPath, ["--no-optional-locks", "status", "--porcelain=v2", "--branch"]);
			return this.parseStatus(output);
		} catch {
			return null;
		}
	}

	static async getBranches(projectPath: string): Promise<GitBranches> {
		const output = await this.run(projectPath, [
			"--no-optional-locks",
			"for-each-ref",
			"--format=%(HEAD)%(refname)",
			"refs/heads",
			"refs/remotes",
		]);

		const result: GitBranches = { current: null, local: [], remote: [] };

		for (const line of output.split(/\r?\n/)) {
			const isCurrent = line.startsWith("*");
			const ref = line.slice(1).trim();

			if (ref.startsWith("refs/heads/")) {
				const name = ref.slice("refs/heads/".length);
				result.local.push(name);
				if (isCurrent) {
					result.current = name;
				}
			} else if (ref.startsWith("refs/remotes/") && !ref.endsWith("/HEAD")) {
				result.remote.push(ref.slice("refs/remotes/".length));
			}
		}

		const local = new Set(result.local);
		result.remote = result.remote.filter((name) => !local.has(name.slice(name.indexOf("/") + 1)));

		return result;
	}

	static async switchBranch(projectPath: string, branch: string, isRemote: boolean): Promise<void> {
		const args = isRemote ? ["switch", "--track", branch] : ["switch", branch];
		await this.run(projectPath, args, SWITCH_TIMEOUT_MS);
	}

	private static parseStatus(output: string): GitInfo {
		const info: GitInfo = { branch: null, changes: 0, ahead: 0, behind: 0, hasUpstream: false };

		for (const line of output.split(/\r?\n/)) {
			if (!line) {
				continue;
			}

			if (line.startsWith("# branch.head ")) {
				const head = line.slice("# branch.head ".length);
				info.branch = head === "(detached)" ? null : head;
			} else if (line.startsWith("# branch.upstream ")) {
				info.hasUpstream = true;
			} else if (line.startsWith("# branch.ab ")) {
				const match = /\+(\d+) -(\d+)/.exec(line);
				info.ahead = Number(match?.[1] ?? 0);
				info.behind = Number(match?.[2] ?? 0);
			} else if (!line.startsWith("#")) {
				info.changes++;
			}
		}

		return info;
	}

	/** --no-optional-locks в командах чтения: не трогаем index.lock, чтобы не мешать IDE */
	private static run(cwd: string, args: string[], timeout = GIT_TIMEOUT_MS): Promise<string> {
		return new Promise((resolve, reject) => {
			execFile(
				"git",
				["-C", cwd, ...args],
				{ timeout, windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
				(error, stdout, stderr) => {
					if (error) {
						const message = stderr.trim() || error.message;
						reject(new Error(message.replace(/^(error|fatal):\s*/i, "")));
						return;
					}
					resolve(stdout);
				},
			);
		});
	}
}
