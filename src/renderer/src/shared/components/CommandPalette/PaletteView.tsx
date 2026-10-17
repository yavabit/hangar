import { FC, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Cloud, Folder as FolderIcon, GitBranch, Search, Star, TriangleAlert } from "lucide-react";
import { useAppStore } from "@renderer/store/app.store";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { useAppNotification } from "@renderer/shared/hooks/useAppNotification";
import { gitApi } from "@renderer/shared/api/git.api";
import { ProjectPath } from "@renderer/shared/components/ProjectPath/ProjectPath";
import { StackAvatar } from "@renderer/shared/components/StackAvatar/StackAvatar";
import { GitBadge } from "@renderer/shared/components/UI/GitBadge/GitBadge";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { sortProjects } from "@renderer/shared/utils/projectFilters";
import { getIpcErrorMessage } from "@renderer/shared/utils/ipcError";
import type { GitBranches } from "@common/api/api.types";
import type { Folder, Project } from "@schemas/store.schema";

import "./CommandPalette.scss";

const MAX_RESULTS = 50;

type PaletteItem =
	| { type: "project"; key: string; project: Project; score: number }
	| { type: "folder"; key: string; folder: Folder; score: number };

type BranchItem = { name: string; remote: boolean; current: boolean };

type PaletteViewProps = {
	/** Перейти на страницу: в главном окне — роутером, из окна поиска — через main */
	onNavigate: (route: string) => void;
	/** Действие выполнено или нажат Esc */
	onClose: () => void;
};

/**
 * Насколько текст подходит под запрос: точное совпадение > начало > начало слова > подстрока > буквы по порядку.
 * «Буквы по порядку» включаются только для коротких строк вроде названий: в длинном пути они находят что угодно.
 */
const matchScore = (text: string | undefined, query: string, fuzzy = false): number => {
	if (!text) {
		return 0;
	}

	const value = text.toLowerCase();
	if (value === query) return 100;
	if (value.startsWith(query)) return 80;
	if (value.split(/[\s\-_./\\@]+/).some((word) => word.startsWith(query))) return 60;
	if (value.includes(query)) return 40;
	if (!fuzzy) return 0;

	let position = 0;
	for (const char of value) {
		if (char === query[position]) {
			position++;
			if (position === query.length) return 10;
		}
	}
	return 0;
};

/** Содержимое быстрого поиска: общее для окна по Ctrl+K и отдельного окна по глобальному хоткею */
export const PaletteView: FC<PaletteViewProps> = ({ onNavigate, onClose }) => {
	const projects = useAppStore((s) => s.projects);
	const folders = useAppStore((s) => s.folders);
	const health = useAppStore((s) => s.health);
	const { openProjectInIde, openProjectFolder, openProjectTerminal } = useProjects();
	const { resolvePath } = usePathAliases();
	const { showSuccess, showError } = useAppNotification();

	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const [branchMode, setBranchMode] = useState<{ project: Project; branches: BranchItem[] | null } | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, [branchMode]);

	const folderNames = useMemo(() => new Map(folders.map((f) => [f.id, f.name])), [folders]);

	const items = useMemo((): PaletteItem[] => {
		const q = query.trim().toLowerCase();

		if (!q) {
			const recent = sortProjects(projects, "opened");
			const ordered = [
				...recent.filter((p) => p.lastOpenedAt),
				...recent.filter((p) => !p.lastOpenedAt && p.isFavorite),
				...recent.filter((p) => !p.lastOpenedAt && !p.isFavorite),
			];
			return ordered.slice(0, MAX_RESULTS).map((project) => ({ type: "project", key: project.id, project, score: 0 }));
		}

		const projectItems: PaletteItem[] = projects
			.map((project) => ({
				type: "project" as const,
				key: project.id,
				project,
				score:
					Math.max(
						matchScore(project.name, q, true),
						matchScore(project.path, q) * 0.6,
						matchScore(resolvePath(project.path), q) * 0.5,
						matchScore(project.folderId ? folderNames.get(project.folderId) : undefined, q) * 0.5,
					) + (project.isFavorite ? 5 : 0),
			}))
			.filter((item) => item.score > 5);

		const folderItems: PaletteItem[] = folders
			.map((folder) => ({ type: "folder" as const, key: folder.id, folder, score: matchScore(folder.name, q, true) * 0.9 }))
			.filter((item) => item.score > 0);

		return [...projectItems, ...folderItems].sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
	}, [query, projects, folders, folderNames, resolvePath]);

	const branchItems = useMemo(() => {
		const q = query.trim().toLowerCase();
		return (branchMode?.branches ?? []).filter((b) => !q || b.name.toLowerCase().includes(q));
	}, [branchMode, query]);

	const count = branchMode ? branchItems.length : items.length;

	useEffect(() => {
		listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	const resetQuery = (): void => {
		setQuery("");
		setActiveIndex(0);
	};

	const openBranches = async (project: Project): Promise<void> => {
		if (!health[project.id]?.git) {
			showError("palette_branches", { message: "Проект не является git-репозиторием", description: project.name });
			return;
		}

		resetQuery();
		setBranchMode({ project, branches: null });
		try {
			const result: GitBranches = await gitApi.branches(project.id);
			setBranchMode({
				project,
				branches: [
					...result.local.map((name) => ({ name, remote: false, current: name === result.current })),
					...result.remote.map((name) => ({ name, remote: true, current: false })),
				],
			});
		} catch (e) {
			setBranchMode(null);
			showError("palette_branches", { message: "Не удалось получить ветки", description: getIpcErrorMessage(e) });
		}
	};

	const switchBranch = async (branch: BranchItem): Promise<void> => {
		if (!branchMode || branch.current) {
			return;
		}

		try {
			await gitApi.switchBranch(branchMode.project.id, branch.name);
			showSuccess("git_switch", { message: "Ветка переключена", description: `${branchMode.project.name}: ${branch.name}`, duration: 2 });
			onClose();
		} catch (e) {
			showError("git_switch", { message: "Не удалось переключить ветку", description: getIpcErrorMessage(e), duration: 8 });
		}
	};

	const runItem = async (item: PaletteItem | undefined, action: "ide" | "explorer" | "terminal" = "ide"): Promise<void> => {
		if (!item) {
			return;
		}

		if (item.type === "folder") {
			onNavigate(`/folder/${item.folder.id}`);
			onClose();
			return;
		}

		onClose();
		if (action === "explorer") {
			await openProjectFolder(item.project.id);
		} else if (action === "terminal") {
			await openProjectTerminal(item.project.id);
		} else {
			await openProjectInIde(item.project.id);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent): void => {
		const ctrl = e.ctrlKey || e.metaKey;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => Math.min(i + 1, count - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			if (branchMode) {
				setBranchMode(null);
				resetQuery();
			} else {
				onClose();
			}
		} else if (e.key === "Backspace" && branchMode && !query) {
			setBranchMode(null);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (branchMode) {
				const branch = branchItems[activeIndex];
				if (branch) {
					void switchBranch(branch);
				}
			} else {
				void runItem(items[activeIndex], ctrl ? "explorer" : "ide");
			}
		} else if (ctrl && e.code === "KeyT" && !branchMode) {
			e.preventDefault();
			void runItem(items[activeIndex], "terminal");
		} else if (ctrl && e.code === "KeyB" && !branchMode) {
			e.preventDefault();
			const item = items[activeIndex];
			if (item?.type === "project") {
				void openBranches(item.project);
			}
		}
	};

	const renderProject = (project: Project): React.ReactNode => {
		const projectHealth = health[project.id];
		const missing = projectHealth?.exists === false;

		return (
			<>
				<StackAvatar stack={projectHealth?.stack} name={project.name} size="sm" />
				<div className="palette__main">
					<div className="palette__title">
						{project.name}
						{project.isFavorite && <Star size={12} fill="#f5a524" color="#f5a524" />}
						{missing && (
							<span className="palette__missing">
								<TriangleAlert size={11} /> нет папки
							</span>
						)}
					</div>
					<div className="palette__subtitle">
						<ProjectPath path={project.path} missing={missing} />
					</div>
				</div>
				<div className="palette__meta">
					{projectHealth?.git && (
						<span className="palette__branch">
							<GitBranch size={11} /> {projectHealth.git.branch ?? "detached"}
						</span>
					)}
					{projectHealth?.git && <GitBadge git={projectHealth.git} />}
					<span className="palette__time">
						{project.folderId && folderNames.get(project.folderId)}
						{project.lastOpenedAt && ` · ${formatRelativeTime(project.lastOpenedAt)}`}
					</span>
				</div>
			</>
		);
	};

	return (
		<div className="palette">
			<label className="palette__input">
				{branchMode ? (
					<button
						type="button"
						className="palette__back"
						aria-label="Назад к проектам"
						onClick={() => {
							setBranchMode(null);
							resetQuery();
						}}
					>
						<ArrowLeft size={16} />
					</button>
				) : (
					<Search size={18} strokeWidth={2} className="palette__search-icon" />
				)}
				{branchMode && <span className="palette__scope">{branchMode.project.name}</span>}
				<input
					ref={inputRef}
					value={query}
					placeholder={branchMode ? "Найти ветку…" : "Найти проект или папку…"}
					aria-label="Поиск"
					onChange={(e) => {
						setQuery(e.target.value);
						setActiveIndex(0);
					}}
					onKeyDown={handleKeyDown}
				/>
				<kbd>Esc</kbd>
			</label>

			<div className="palette__list" ref={listRef} role="listbox">
				{branchMode && !branchMode.branches && <div className="palette__empty">Загружаем ветки…</div>}
				{count === 0 && (!branchMode || branchMode.branches) && <div className="palette__empty">Ничего не найдено</div>}

				{branchMode
					? branchItems.map((branch, index) => (
						<div
							key={`${branch.remote}:${branch.name}`}
							role="option"
							aria-selected={index === activeIndex}
							data-index={index}
							className={`palette__item ${index === activeIndex ? "palette__item--active" : ""}`}
							onMouseMove={() => setActiveIndex(index)}
							onClick={() => void switchBranch(branch)}
						>
							<span className="palette__icon">
								{branch.current ? <Check size={15} /> : branch.remote ? <Cloud size={15} /> : <GitBranch size={15} />}
							</span>
							<div className="palette__main">
								<div className="palette__title">{branch.name}</div>
								<div className="palette__subtitle">
									{branch.current ? "Текущая ветка" : branch.remote ? "Ветка на сервере — будет создана локально" : "Локальная ветка"}
								</div>
							</div>
						</div>
					))
					: items.map((item, index) => (
						<div
							key={item.key}
							role="option"
							aria-selected={index === activeIndex}
							data-index={index}
							className={`palette__item ${index === activeIndex ? "palette__item--active" : ""}`}
							onMouseMove={() => setActiveIndex(index)}
							onClick={(e) => void runItem(item, e.ctrlKey || e.metaKey ? "explorer" : "ide")}
						>
							{item.type === "project" ? (
								renderProject(item.project)
							) : (
								<>
									<span className="palette__icon palette__icon--folder">
										<FolderIcon size={15} />
									</span>
									<div className="palette__main">
										<div className="palette__title">{item.folder.name}</div>
										<div className="palette__subtitle">Папка · перейти</div>
									</div>
								</>
							)}
						</div>
					))}
			</div>

			<div className="palette__footer">
				{branchMode ? (
					<>
						<span><kbd>Enter</kbd> переключить</span>
						<span><kbd>Esc</kbd> назад</span>
					</>
				) : (
					<>
						<span><kbd>Enter</kbd> в IDE</span>
						<span><kbd>Ctrl</kbd><kbd>Enter</kbd> в проводнике</span>
						<span><kbd>Ctrl</kbd><kbd>T</kbd> терминал</span>
						<span><kbd>Ctrl</kbd><kbd>B</kbd> ветка</span>
					</>
				)}
				<span className="palette__brand">Hangar</span>
			</div>
		</div>
	);
};
