export const STACKS = {
	next: { label: "Next.js", short: "Nx", color: "#9aa3b2" },
	nuxt: { label: "Nuxt", short: "Nu", color: "#00dc82" },
	astro: { label: "Astro", short: "As", color: "#ff5d01" },
	electron: { label: "Electron", short: "El", color: "#5fb3c2" },
	angular: { label: "Angular", short: "Ng", color: "#e23237" },
	svelte: { label: "Svelte", short: "Sv", color: "#ff3e00" },
	vue: { label: "Vue", short: "Vu", color: "#42b883" },
	react: { label: "React", short: "Re", color: "#61dafb" },
	nest: { label: "NestJS", short: "Ne", color: "#e0234e" },
	node: { label: "Node.js", short: "No", color: "#5fa04e" },
	deno: { label: "Deno", short: "De", color: "#70d6a0" },
	go: { label: "Go", short: "Go", color: "#00add8" },
	rust: { label: "Rust", short: "Rs", color: "#dea584" },
	python: { label: "Python", short: "Py", color: "#4b8bbe" },
	php: { label: "PHP", short: "Ph", color: "#8892bf" },
	java: { label: "Java", short: "Ja", color: "#e76f00" },
	kotlin: { label: "Kotlin", short: "Kt", color: "#9b6dff" },
	dotnet: { label: ".NET", short: ".N", color: "#8a6cf0" },
	ruby: { label: "Ruby", short: "Rb", color: "#e0463c" },
	dart: { label: "Dart", short: "Dt", color: "#2b9de0" },
	swift: { label: "Swift", short: "Sw", color: "#f05138" },
	cpp: { label: "C/C++", short: "C+", color: "#659ad2" },
	docker: { label: "Docker", short: "Dk", color: "#2496ed" },
} as const;

export type StackId = keyof typeof STACKS;

export const isStackId = (value: unknown): value is StackId =>
	typeof value === "string" && Object.prototype.hasOwnProperty.call(STACKS, value);
