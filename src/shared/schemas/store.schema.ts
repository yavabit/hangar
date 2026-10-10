import { z } from "zod";

export const ProjectSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	path: z.string(),
	lastOpened: z.string(),
	isFavorite: z.boolean(),
	folderId: z.uuid().optional(),
	icon: z.string().optional(),
	gitUrl: z.string().optional(),
	gitStatus: z.enum(["outdated", "uptodate", "uncommited"]).optional(),
});

export const FolderSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().optional(),
	path: z.string().optional(),
	lastDate: z.string().optional(),
	icon: z.string().optional(),
});

export const PathAliasSchema = z.object({
  id: z.uuid(),
  alias: z.string(),
  path: z.string(),
  color: z.string(),
});

export const CommonSettingsSchema = z.object({
	defaultIDE: z.enum(["vscode", "webstorm", "intellij"]),
	defaultConsole: z.string(),
	taskTrackerUrl: z.string(),
	pathAliases: z.array(PathAliasSchema).optional(),
});

export const GitSettingsSchema = z.object({
	gitSynch: z.boolean(),
	gitProvider: z.enum(["github", "gitlab"]).optional(),
	url: z.string().optional(),
});

export const AppSettingsSchema = z.object({
	common: CommonSettingsSchema,
	git: GitSettingsSchema,
});

export const StoreSchema = z.object({
	version: z.number(),
	settings: AppSettingsSchema,
	projects: z.array(ProjectSchema),
	folders: z.array(FolderSchema),
});

export type Project = z.infer<typeof ProjectSchema>;

export type Folder = z.infer<typeof FolderSchema>;

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type StoreType = z.infer<typeof StoreSchema>;

export type PathAliasSchemaType = z.infer<typeof PathAliasSchema>;
