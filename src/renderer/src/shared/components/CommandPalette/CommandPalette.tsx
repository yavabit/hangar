import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Input, InputRef, Modal, Tag, Typography } from "antd";
import { FolderOutlined, SearchOutlined, StarFilled, WarningOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@renderer/store/app.store";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { ProjectPath } from "@renderer/shared/components/ProjectPath/ProjectPath";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { sortProjects } from "@renderer/shared/utils/projectFilters";
import type { Folder, Project } from "@schemas/store.schema";

import "./CommandPalette.scss";

const MAX_RESULTS = 50;

type PaletteItem =
	| { type: "project"; key: string; project: Project; score: number }
	| { type: "folder"; key: string; folder: Folder; score: number };

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

export const CommandPalette: FC = () => {
	const navigate = useNavigate();
	const projects = useAppStore((s) => s.projects);
	const folders = useAppStore((s) => s.folders);
	const health = useAppStore((s) => s.health);
	const { openProjectInIde, openProjectFolder } = useProjects();
	const { resolvePath } = usePathAliases();

	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const fromHotkey = useRef(false);
	const inputRef = useRef<InputRef>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const show = (viaHotkey: boolean): void => {
		fromHotkey.current = viaHotkey;
		setQuery("");
		setActiveIndex(0);
		setOpen(true);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent): void => {
			if ((e.ctrlKey || e.metaKey) && e.code === "KeyK" && !e.repeat) {
				e.preventDefault();
				show(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		const unsubscribe = window.api.app.onOpenPalette(({ fromHotkey: viaHotkey }) => show(viaHotkey));

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			unsubscribe();
		};
	}, []);

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

	useEffect(() => {
		listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	const close = (): void => setOpen(false);

	const runItem = async (item: PaletteItem | undefined, inExplorer = false): Promise<void> => {
		if (!item) {
			return;
		}

		close();

		if (item.type === "folder") {
			navigate(`/folder/${item.folder.id}`);
			return;
		}

		if (inExplorer) {
			await openProjectFolder(item.project.id);
		} else {
			await openProjectInIde(item.project.id);
		}

		if (fromHotkey.current) {
			void window.api.app.hide();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent): void => {
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setActiveIndex((i) => Math.min(i + 1, items.length - 1));
				break;
			case "ArrowUp":
				e.preventDefault();
				setActiveIndex((i) => Math.max(i - 1, 0));
				break;
			case "Enter":
				e.preventDefault();
				void runItem(items[activeIndex], e.ctrlKey || e.metaKey);
				break;
		}
	};

	return (
		<Modal
			open={open}
			onCancel={close}
			footer={null}
			closable={false}
			width={680}
			style={{ top: 90 }}
			styles={{ container: { padding: 0, overflow: "hidden" } }}
			afterOpenChange={(visible) => visible && inputRef.current?.focus()}
			destroyOnHidden
			className="command-palette"
		>
			<Input
				ref={inputRef}
				size="large"
				variant="borderless"
				prefix={<SearchOutlined style={{ color: "#bfbfbf", marginRight: 6 }} />}
				placeholder="Найти проект или папку…"
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setActiveIndex(0);
				}}
				onKeyDown={handleKeyDown}
				className="command-palette__input"
			/>
			<div className="command-palette__list" ref={listRef}>
				{items.length === 0 && (
					<div className="command-palette__empty">Ничего не найдено</div>
				)}
				{items.map((item, index) => (
					<div
						key={item.key}
						data-index={index}
						className={`command-palette__item ${index === activeIndex ? "command-palette__item--active" : ""}`}
						onMouseMove={() => setActiveIndex(index)}
						onClick={(e) => void runItem(item, e.ctrlKey || e.metaKey)}
					>
						{item.type === "project" ? (
							<>
								<span className="command-palette__icon">
									{item.project.isFavorite ? <StarFilled style={{ color: "#faad14" }} /> : <span className="command-palette__dot" />}
								</span>
								<div className="command-palette__main">
									<div className="command-palette__title">
										{item.project.name}
										{health[item.project.id]?.exists === false && (
											<Tag color="error" icon={<WarningOutlined />} bordered={false}>
												нет папки
											</Tag>
										)}
									</div>
									<div className="command-palette__subtitle">
										<ProjectPath path={item.project.path} missing={health[item.project.id]?.exists === false} />
									</div>
								</div>
								<div className="command-palette__meta">
									{item.project.folderId && folderNames.get(item.project.folderId) && (
										<Typography.Text type="secondary">
											<FolderOutlined /> {folderNames.get(item.project.folderId)}
										</Typography.Text>
									)}
									{item.project.lastOpenedAt && (
										<Typography.Text type="secondary">
											{formatRelativeTime(item.project.lastOpenedAt)}
										</Typography.Text>
									)}
								</div>
							</>
						) : (
							<>
								<span className="command-palette__icon">
									<FolderOutlined style={{ color: "#3689ee" }} />
								</span>
								<div className="command-palette__main">
									<div className="command-palette__title">{item.folder.name}</div>
									<div className="command-palette__subtitle">Папка · перейти</div>
								</div>
							</>
						)}
					</div>
				))}
			</div>
			<div className="command-palette__footer">
				<span><kbd>↑</kbd><kbd>↓</kbd> выбор</span>
				<span><kbd>Enter</kbd> открыть в IDE</span>
				<span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> в проводнике</span>
				<span><kbd>Esc</kbd> закрыть</span>
			</div>
		</Modal>
	);
};
