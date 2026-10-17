import { ipcMain } from "electron";

import { ProjectsStorage } from "../storage/projects.storage";
import { ProjectService } from "../services/projects.service";
import { GitService } from "../services/git.service";
import { StatusService } from "../services/status.service";
import type { Project } from "../../shared/schemas/store.schema";

const getRepositoryPath = async (id: Project["id"]): Promise<string> => {
	const project = ProjectsStorage.getById(id);
	if (!project) {
		throw new Error("Проект не найден");
	}

	const path = ProjectService.resolvePath(project.path);
	if (!(await GitService.isRepository(path))) {
		throw new Error("Папка проекта не является git-репозиторием");
	}

	return path;
};

export function registerGitIpc(): void {
	ipcMain.handle("git:branches", async (_, id: Project["id"]) => {
		return GitService.getBranches(await getRepositoryPath(id));
	});

	ipcMain.handle("git:switchBranch", async (_, id: Project["id"], branch: string) => {
		const path = await getRepositoryPath(id);
		const { remote } = await GitService.getBranches(path);

		try {
			await GitService.switchBranch(path, branch, remote.includes(branch));
		} finally {
			await StatusService.refreshProject(id);
		}
	});
}
