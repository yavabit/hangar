import type { ElectronApi } from "@common/api/api.types";

export const gitApi: ElectronApi["git"] = {
	branches: (projectId) => window.api.git.branches(projectId),

	switchBranch: (projectId, branch) => window.api.git.switchBranch(projectId, branch),
};
