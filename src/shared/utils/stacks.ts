export const STACKS = {
	next: { label: "Next.js", color: "#a0a7b4" },
	nuxt: { label: "Nuxt", color: "#00dc82" },
	remix: { label: "Remix", color: "#a0a7b4" },
	astro: { label: "Astro", color: "#bc52ee" },
	electron: { label: "Electron", color: "#5fb3c2" },
	tauri: { label: "Tauri", color: "#24c8d8" },
	angular: { label: "Angular", color: "#e23237" },
	svelte: { label: "Svelte", color: "#ff3e00" },
	solid: { label: "Solid", color: "#4f88c6" },
	vue: { label: "Vue", color: "#42b883" },
	react: { label: "React", color: "#61dafb" },
	nest: { label: "NestJS", color: "#e0234e" },
	express: { label: "Express", color: "#a0a7b4" },
	node: { label: "Node.js", color: "#5fa04e" },
	typescript: { label: "TypeScript", color: "#3178c6" },
	deno: { label: "Deno", color: "#70d6a0" },
	go: { label: "Go", color: "#00add8" },
	rust: { label: "Rust", color: "#dea584" },
	python: { label: "Python", color: "#4b8bbe" },
	django: { label: "Django", color: "#44b78b" },
	fastapi: { label: "FastAPI", color: "#05998b" },
	flask: { label: "Flask", color: "#a0a7b4" },
	php: { label: "PHP", color: "#8892bf" },
	laravel: { label: "Laravel", color: "#ff2d20" },
	symfony: { label: "Symfony", color: "#a0a7b4" },
	java: { label: "Java", color: "#e76f00" },
	spring: { label: "Spring", color: "#6db33f" },
	kotlin: { label: "Kotlin", color: "#9b6dff" },
	dotnet: { label: ".NET", color: "#8a6cf0" },
	ruby: { label: "Ruby", color: "#e0463c" },
	rails: { label: "Rails", color: "#e0463c" },
	dart: { label: "Dart", color: "#2b9de0" },
	flutter: { label: "Flutter", color: "#47c5fb" },
	swift: { label: "Swift", color: "#f05138" },
	cpp: { label: "C/C++", color: "#659ad2" },
	docker: { label: "Docker", color: "#2496ed" },
} as const;

export type StackId = keyof typeof STACKS;

export const isStackId = (value: unknown): value is StackId =>
	typeof value === "string" && Object.prototype.hasOwnProperty.call(STACKS, value);

export const formatStacks = (stacks: readonly StackId[]): string => stacks.map((id) => STACKS[id].label).join(" + ");
