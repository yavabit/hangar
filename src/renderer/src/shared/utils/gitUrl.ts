export type GitHost = "github" | "gitlab" | "other";

/**
 * Превращает remote-адрес репозитория в ссылку для браузера:
 * git@github.com:user/repo.git → https://github.com/user/repo
 */
export const toGitWebUrl = (gitUrl?: string): string | null => {
	const url = gitUrl?.trim();
	if (!url) {
		return null;
	}

	const scp = /^[\w.-]+@([\w.-]+):(.+)$/.exec(url);
	if (scp) {
		return `https://${scp[1]}/${scp[2].replace(/\.git$/, "")}`;
	}

	try {
		const parsed = new URL(url);
		if (!["http:", "https:", "ssh:", "git:"].includes(parsed.protocol)) {
			return null;
		}

		return `https://${parsed.hostname}${parsed.pathname.replace(/\.git$/, "")}`;
	} catch {
		return null;
	}
};

export const getGitHost = (gitUrl?: string): GitHost => {
	const url = gitUrl?.toLowerCase() ?? "";

	if (url.includes("github")) {
		return "github";
	}

	if (url.includes("gitlab")) {
		return "gitlab";
	}

	return "other";
};
