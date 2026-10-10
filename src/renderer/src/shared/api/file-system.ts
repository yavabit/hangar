export const fileSystemApi = {
	selectFolder: () => window.api.fileSystem.selectFolder(),
};

export type FileSystemApi = typeof fileSystemApi;