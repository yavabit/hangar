import type { ElectronApi } from "@common/api/api.types";

export const fileSystemApi: ElectronApi["fileSystem"] = {
	selectFolder: (defaultPath) => window.api.fileSystem.selectFolder(defaultPath),
};
