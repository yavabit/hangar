import { FC } from "react";
import { Tooltip } from "antd";
import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { Folder } from "@schemas/store.schema";
import { useAppStore } from "@renderer/store/app.store";
import { useUiStore } from "@renderer/store/ui.store";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import { useFolderTree, type FolderTree } from "@renderer/shared/hooks/useFolderTree";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { ProjectDropZone } from "@renderer/shared/components/ProjectDropZone/ProjectDropZone";
import { FOLDER_DRAG_TYPE } from "@renderer/shared/utils/dragAndDrop";

const INDENT_PX = 14;

type FolderNodeProps = {
	folder: Folder;
	depth: number;
	tree: FolderTree;
	collapsed: boolean;
};

const FolderNode: FC<FolderNodeProps> = ({ folder, depth, tree, collapsed }) => {
	const projects = useAppStore((s) => s.projects);
	const collapsedIds = useUiStore((s) => s.collapsedFolderIds);
	const toggleFolderCollapsed = useUiStore((s) => s.toggleFolderCollapsed);
	const setDraggingFolderId = useUiStore((s) => s.setDraggingFolderId);
	const { moveProject } = useProjects();
	const { moveFolder } = useFolders();

	const children = collapsed ? [] : tree.childrenOf(folder.id);
	const expanded = !collapsedIds.includes(folder.id);
	const count = tree.projectsIn(folder.id).length;

	return (
		<>
			<ProjectDropZone
				className="sidebar__drop"
				onDropProject={(projectId) => void moveProject(projectId, folder)}
				accepts={(projectId) => projects.find((p) => p.id === projectId)?.folderId !== folder.id}
				onDropFolder={(folderId) => void moveFolder(folderId, folder.id)}
				acceptsFolder={(folderId) => folderId !== folder.id && tree.folders.find((f) => f.id === folderId)?.parentId !== folder.id && tree.canMove(folderId, folder.id)}
			>
				<Tooltip title={collapsed ? tree.pathLabel(folder.id) : undefined} placement="right">
					<NavLink
						to={`/folder/${folder.id}`}
						className={({ isActive }) => `sidebar__item sidebar__item--folder ${isActive ? "sidebar__item--active" : ""}`}
						style={collapsed ? undefined : { paddingLeft: 10 + depth * INDENT_PX }}
						draggable={!collapsed}
						onDragStart={(e) => {
							e.dataTransfer.setData(FOLDER_DRAG_TYPE, folder.id);
							e.dataTransfer.effectAllowed = "move";
							setDraggingFolderId(folder.id);
						}}
						onDragEnd={() => setDraggingFolderId(null)}
					>
						{!collapsed && (
							<button
								type="button"
								className={`sidebar__chevron ${children.length ? "" : "sidebar__chevron--empty"} ${expanded ? "sidebar__chevron--open" : ""}`}
								aria-label={expanded ? "Свернуть" : "Развернуть"}
								tabIndex={children.length ? 0 : -1}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									if (children.length) {
										toggleFolderCollapsed(folder.id);
									}
								}}
							>
								<ChevronRight size={13} strokeWidth={2} />
							</button>
						)}
						<span className="sidebar__folder-mark">{collapsed ? folder.name.slice(0, 1).toUpperCase() : null}</span>
						{!collapsed && (
							<>
								<span className="sidebar__item-label">{folder.name}</span>
								<span className="sidebar__count">{count}</span>
							</>
						)}
					</NavLink>
				</Tooltip>
			</ProjectDropZone>
			{expanded &&
				children.map((child) => (
					<FolderNode key={child.id} folder={child} depth={depth + 1} tree={tree} collapsed={collapsed} />
				))}
		</>
	);
};

type SidebarFoldersProps = {
	collapsed: boolean;
	/** Кнопка «Новая папка» в заголовке раздела */
	createButton: React.ReactNode;
};

/** Дерево папок: сворачивается, принимает проекты и папки перетаскиванием */
export const SidebarFolders: FC<SidebarFoldersProps> = ({ collapsed, createButton }) => {
	const tree = useFolderTree();
	const { moveFolder } = useFolders();
	const roots = tree.childrenOf(undefined);

	return (
		<>
			{!collapsed && (
				<ProjectDropZone
					className="sidebar__drop"
					onDropFolder={(folderId) => void moveFolder(folderId, undefined)}
					acceptsFolder={(folderId) => !!tree.folders.find((f) => f.id === folderId)?.parentId}
				>
					<div className="sidebar__heading">
						<span>Папки</span>
						{createButton}
					</div>
				</ProjectDropZone>
			)}
			<div className="sidebar__folders">
				{roots.map((folder) => (
					<FolderNode key={folder.id} folder={folder} depth={0} tree={tree} collapsed={collapsed} />
				))}
				{!roots.length && !collapsed && <div className="sidebar__hint">Папок пока нет</div>}
			</div>
		</>
	);
};
