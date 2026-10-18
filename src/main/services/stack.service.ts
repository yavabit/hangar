import { promises as fs, type Dirent } from "fs";
import { basename, join } from "path";
import type { StackId } from "../../shared/utils/stacks";

const MAX_STACKS = 3;
const MAX_CHILD_DIRS = 24;

/** Папки, где лежат части монорепозитория: apps/web, packages/api и т.п. */
const WORKSPACE_DIRS = new Set(["apps", "packages", "services", "libs", "modules"]);

/** В этих папках не бывает отдельных частей проекта, а нативные обёртки мобильных приложений путают стек */
const SKIPPED_DIRS = new Set([
	"node_modules", "dist", "build", "out", "target", "vendor", "coverage", "tmp", "bin", "obj",
	"public", "static", "assets", "docs", "examples", "fixtures", "test", "tests", "e2e", "scripts", "tools",
	"android", "ios", "macos", "windows", "linux", "__pycache__", "venv", "env",
]);

/** Стеки, которые мало что говорят о проекте: показываем, только если ничего точнее не нашлось */
const GENERIC_STACKS = new Set<StackId>(["node", "typescript", "docker"]);

const NODE_SHELLS: [dependency: string, stack: StackId][] = [["electron", "electron"]];

/** Фреймворк интерфейса: первый найденный по приоритету */
const NODE_FRAMEWORKS: [dependency: string, stack: StackId][] = [
	["next", "next"],
	["nuxt", "nuxt"],
	["@remix-run/react", "remix"],
	["astro", "astro"],
	["@angular/core", "angular"],
	["@sveltejs/kit", "svelte"],
	["svelte", "svelte"],
	["solid-js", "solid"],
	["vue", "vue"],
	["react-native", "react"],
	["react", "react"],
];

const NODE_SERVERS: [dependency: string, stack: StackId][] = [
	["@nestjs/core", "nest"],
	["express", "express"],
];

const readEntries = async (dir: string): Promise<Dirent[] | null> => {
	try {
		return await fs.readdir(dir, { withFileTypes: true });
	} catch {
		return null;
	}
};

const readText = (path: string): Promise<string> => fs.readFile(path, "utf8").catch(() => "");

const findDependency = (deps: Record<string, unknown>, list: [string, StackId][]): StackId | undefined =>
	list.find(([dependency]) => dependency in deps)?.[1];

const detectNode = async (dir: string): Promise<StackId[]> => {
	try {
		const pkg = JSON.parse(await readText(join(dir, "package.json")));
		const deps = { ...pkg.dependencies, ...pkg.devDependencies };
		const stacks = [findDependency(deps, NODE_SHELLS), findDependency(deps, NODE_FRAMEWORKS), findDependency(deps, NODE_SERVERS)]
			.filter((stack): stack is StackId => !!stack);

		if (stacks.length) {
			return stacks;
		}
		return ["typescript" in deps ? "typescript" : "node"];
	} catch {
		return ["node"];
	}
};

const detectPython = async (dir: string, names: Set<string>): Promise<StackId> => {
	if (names.has("manage.py")) {
		return "django";
	}

	const manifest = (await Promise.all(["requirements.txt", "pyproject.toml", "Pipfile"].map((f) => readText(join(dir, f))))).join("\n").toLowerCase();
	if (/\bdjango\b/.test(manifest)) {
		return "django";
	}
	if (/\bfastapi\b/.test(manifest)) {
		return "fastapi";
	}
	if (/\bflask\b/.test(manifest)) {
		return "flask";
	}
	return "python";
};

const detectJvm = async (dir: string, names: Set<string>): Promise<StackId> => {
	const build = (await Promise.all(["pom.xml", "build.gradle", "build.gradle.kts"].map((f) => readText(join(dir, f))))).join("\n");
	if (/spring-boot|org\.springframework/.test(build)) {
		return "spring";
	}
	if (names.has("build.gradle.kts") || /kotlin/.test(build)) {
		return "kotlin";
	}
	return "java";
};

/** Стек одной папки по файлам в ней */
const detectDir = async (dir: string, entries: Dirent[]): Promise<StackId[]> => {
	const names = new Set(entries.map((e) => e.name));
	const has = (...files: string[]): boolean => files.some((f) => names.has(f));

	if (basename(dir) === "src-tauri" && has("Cargo.toml", "tauri.conf.json")) {
		return ["tauri"];
	}
	if (has("package.json")) {
		return detectNode(dir);
	}
	if (has("deno.json", "deno.jsonc")) {
		return ["deno"];
	}
	if (has("go.mod")) {
		return ["go"];
	}
	if (has("Cargo.toml")) {
		return ["rust"];
	}
	if (has("pubspec.yaml")) {
		return [/^\s*flutter:/m.test(await readText(join(dir, "pubspec.yaml"))) ? "flutter" : "dart"];
	}
	if (has("Package.swift")) {
		return ["swift"];
	}
	if (has("composer.json")) {
		return [has("artisan") ? "laravel" : has("symfony.lock") ? "symfony" : "php"];
	}
	if (has("pom.xml", "build.gradle", "build.gradle.kts")) {
		return [await detectJvm(dir, names)];
	}
	if (entries.some((e) => /\.(sln|csproj|fsproj)$/i.test(e.name))) {
		return ["dotnet"];
	}
	if (has("Gemfile")) {
		return [/['"]rails['"]/.test(await readText(join(dir, "Gemfile"))) ? "rails" : "ruby"];
	}
	if (has("pyproject.toml", "requirements.txt", "setup.py", "Pipfile", "manage.py")) {
		return [await detectPython(dir, names)];
	}
	if (has("CMakeLists.txt")) {
		return ["cpp"];
	}
	if (has("Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yaml")) {
		return ["docker"];
	}
	return [];
};

const subDirs = (dir: string, entries: Dirent[], limit: number): string[] =>
	entries
		.filter((e) => e.isDirectory() && !e.name.startsWith(".") && !SKIPPED_DIRS.has(e.name.toLowerCase()))
		.slice(0, limit)
		.map((e) => join(dir, e.name));

/** Части проекта: подпапки вроде frontend/ и backend/, а в монорепозитории — apps/* и packages/* */
const detectParts = async (projectPath: string, entries: Dirent[]): Promise<StackId[]> => {
	const dirs = subDirs(projectPath, entries, MAX_CHILD_DIRS);

	const results = await Promise.all(
		dirs.map(async (dir) => {
			const childEntries = await readEntries(dir);
			if (!childEntries) {
				return [];
			}
			if (WORKSPACE_DIRS.has(basename(dir).toLowerCase())) {
				const nested = await Promise.all(
					subDirs(dir, childEntries, MAX_CHILD_DIRS).map(async (child) => {
						const nestedEntries = await readEntries(child);
						return nestedEntries ? detectDir(child, nestedEntries) : [];
					}),
				);
				return nested.flat();
			}
			return detectDir(dir, childEntries);
		}),
	);

	return results.flat();
};

/**
 * Стеки проекта, главный первым. Смотрим корень и подпапки первого уровня:
 * у проекта из фронтенда и бэкенда в одной папке будет, например, React + Go.
 */
export const detectStacks = async (projectPath: string): Promise<StackId[]> => {
	const entries = await readEntries(projectPath);
	if (!entries) {
		return [];
	}

	const root = await detectDir(projectPath, entries);
	const isMobile = root.includes("flutter") || root.includes("dart");
	const parts = isMobile ? [] : await detectParts(projectPath, entries);

	const rootIsGeneric = root.every((stack) => GENERIC_STACKS.has(stack));
	const hasSpecificParts = parts.some((stack) => !GENERIC_STACKS.has(stack));
	let stacks = [...new Set([...(hasSpecificParts && rootIsGeneric ? [] : root), ...parts])];

	if (stacks.some((stack) => !GENERIC_STACKS.has(stack))) {
		stacks = stacks.filter((stack) => stack !== "docker");
	}
	if (stacks.includes("tauri")) {
		stacks = stacks.filter((stack) => stack !== "rust");
	}

	return stacks.slice(0, MAX_STACKS);
};
