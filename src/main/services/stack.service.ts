import { promises as fs } from "fs";
import { join } from "path";
import type { StackId } from "../../shared/utils/stacks";

/** Зависимости package.json по приоритету: фреймворк важнее библиотеки */
const NODE_STACKS: [dependency: string, stack: StackId][] = [
	["next", "next"],
	["nuxt", "nuxt"],
	["astro", "astro"],
	["electron", "electron"],
	["@angular/core", "angular"],
	["@sveltejs/kit", "svelte"],
	["svelte", "svelte"],
	["vue", "vue"],
	["react", "react"],
	["@nestjs/core", "nest"],
];

const FILE_STACKS: [test: (names: Set<string>, files: string[]) => boolean, stack: StackId][] = [
	[(names) => names.has("deno.json") || names.has("deno.jsonc"), "deno"],
	[(names) => names.has("go.mod"), "go"],
	[(names) => names.has("Cargo.toml"), "rust"],
	[(names) => names.has("pubspec.yaml"), "dart"],
	[(names) => names.has("Package.swift"), "swift"],
	[(names) => names.has("composer.json"), "php"],
	[(names) => names.has("build.gradle.kts"), "kotlin"],
	[(names) => names.has("pom.xml") || names.has("build.gradle"), "java"],
	[(_, files) => files.some((f) => /\.(sln|csproj|fsproj)$/i.test(f)), "dotnet"],
	[(names) => names.has("Gemfile"), "ruby"],
	[(names) => ["pyproject.toml", "requirements.txt", "setup.py", "Pipfile"].some((f) => names.has(f)), "python"],
	[(names) => names.has("CMakeLists.txt"), "cpp"],
	[(names) => names.has("Dockerfile") || names.has("docker-compose.yml"), "docker"],
];

const readNodeStack = async (projectPath: string): Promise<StackId> => {
	try {
		const pkg = JSON.parse(await fs.readFile(join(projectPath, "package.json"), "utf8"));
		const deps = { ...pkg.dependencies, ...pkg.devDependencies };
		return NODE_STACKS.find(([dependency]) => dependency in deps)?.[1] ?? "node";
	} catch {
		return "node";
	}
};

/** Стек проекта по файлам в корне папки. null — определить не удалось */
export const detectStack = async (projectPath: string): Promise<StackId | null> => {
	let files: string[];
	try {
		files = await fs.readdir(projectPath);
	} catch {
		return null;
	}

	const names = new Set(files);
	if (names.has("package.json")) {
		return readNodeStack(projectPath);
	}

	return FILE_STACKS.find(([test]) => test(names, files))?.[1] ?? null;
};
