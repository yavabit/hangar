import type { ProjectHealth, ProjectsHealth } from "../../shared/api/api.types";
import type { Project } from "../../shared/schemas/store.schema";
import { ProjectsStorage } from "../storage/projects.storage";
import { SettingsStorage } from "../storage/settings.storage";
import { GitService } from "./git.service";
import { ProjectService } from "./projects.service";
import { detectStacks } from "./stack.service";

const CONCURRENCY = 4;
const MINUTE_MS = 60 * 1000;

type Listener = (health: ProjectsHealth) => void;
type CheckedListener = (checkedAt: string) => void;

/**
 * force — полная проверка сейчас;
 * auto — полная, если с прошлой прошло больше интервала из настроек, иначе только наличие папок;
 * existence — только наличие папок, это дёшево.
 */
type RefreshMode = "force" | "auto" | "existence";

const mapLimit = async <T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> => {
	let index = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (index < items.length) {
			await fn(items[index++]);
		}
	});
	await Promise.all(workers);
};

const getIntervalMs = (): number => SettingsStorage.get().statusRefresh.intervalMinutes * MINUTE_MS;

/**
 * Состояние проектов на диске: существует ли папка и что с git.
 * Хранится только в памяти — это производные данные, их всегда можно пересчитать.
 *
 * Когда обновляется (настраивается в «Настройки → Обновление статусов»):
 * - при старте и по кнопке «Обновить» — полностью;
 * - при возврате в окно — наличие папок всегда, git и даты не чаще интервала;
 * - по таймеру, пока окно открыто, если он включён;
 * - после открытия проекта в IDE и смены ветки — только этот проект.
 */
class StatusServiceImpl {
	private health: ProjectsHealth = {};
	private lastDeepRefresh = 0;
	private running: Promise<void> | null = null;
	private listeners = new Set<Listener>();
	private checkedListeners = new Set<CheckedListener>();
	private timer: NodeJS.Timeout | null = null;

	getHealth(): ProjectsHealth {
		return this.health;
	}

	getCheckedAt(): string | null {
		return this.lastDeepRefresh ? new Date(this.lastDeepRefresh).toISOString() : null;
	}

	onUpdate(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	onChecked(listener: CheckedListener): () => void {
		this.checkedListeners.add(listener);
		return () => this.checkedListeners.delete(listener);
	}

	async refresh(mode: RefreshMode = "auto"): Promise<void> {
		if (this.running) {
			return this.running;
		}

		const deep = mode === "force" || (mode === "auto" && Date.now() - this.lastDeepRefresh > getIntervalMs());

		this.running = this.run(deep).finally(() => {
			this.running = null;
		});
		return this.running;
	}

	onWindowFocus(): Promise<void> {
		return this.refresh(SettingsStorage.get().statusRefresh.onFocus ? "auto" : "existence");
	}

	/** Перезапускает фоновый таймер по текущим настройкам. Пока окно скрыто, проверки пропускаются */
	applySchedule(isWindowVisible: () => boolean): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}

		const { background } = SettingsStorage.get().statusRefresh;
		if (!background) {
			return;
		}

		this.timer = setInterval(() => {
			if (isWindowVisible()) {
				void this.refresh("force");
			}
		}, getIntervalMs());
	}

	async refreshProject(id: Project["id"]): Promise<void> {
		const project = ProjectsStorage.getById(id);
		if (!project) {
			return;
		}

		this.health = { ...this.health, [id]: await this.check(project, true) };
		this.emit();
	}

	private async run(deep: boolean): Promise<void> {
		const projects = ProjectsStorage.getAll();
		const next: ProjectsHealth = {};

		await mapLimit(projects, CONCURRENCY, async (project) => {
			next[project.id] = await this.check(project, deep);
		});

		this.health = next;
		this.emit();

		if (deep) {
			this.lastDeepRefresh = Date.now();
			const checkedAt = this.getCheckedAt() as string;
			this.checkedListeners.forEach((listener) => listener(checkedAt));
			await ProjectService.refreshLastModifiedTimestamps();
		}
	}

	private async check(project: Project, deep: boolean): Promise<ProjectHealth> {
		const path = ProjectService.resolvePath(project.path);
		const exists = await ProjectService.isDirectory(path);

		if (!exists) {
			return { exists, git: null, stacks: [] };
		}

		const prev = this.health[project.id];
		const fresh = deep || !prev?.exists;
		return {
			exists,
			git: fresh ? await GitService.getInfo(path) : prev.git,
			stacks: fresh ? await detectStacks(path) : prev.stacks,
		};
	}

	private emit(): void {
		this.listeners.forEach((listener) => listener(this.health));
	}
}

export const StatusService = new StatusServiceImpl();
