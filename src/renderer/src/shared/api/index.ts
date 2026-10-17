import { settingsApi } from "./settings.api";

import { projectsApi } from "./projects.api";
import { fileSystemApi } from "./file-system";
import { foldersApi } from "./folders.api";
import { gitApi } from "./git.api";

export const api = {
	settings: settingsApi,
	projects: projectsApi,
	fileSystem: fileSystemApi,
	folders: foldersApi,
	git: gitApi,
};
