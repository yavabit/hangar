import { FC, ReactNode, useState } from "react";
import { Switch } from "antd";
import { Folder as FolderIcon, Layers, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProjectsHealth } from "@common/api/api.types";
import { Folder as FolderType, Project } from "@schemas/store.schema";
import { CardShell } from "@renderer/shared/components/UI/CardShell/CardShell";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";
import { DeleteAction, type DeleteConfirm } from "@renderer/shared/components/UI/DeleteAction/DeleteAction";
import { ProjectDropZone } from "@renderer/shared/components/ProjectDropZone/ProjectDropZone";
import { StackAvatar } from "@renderer/shared/components/StackAvatar/StackAvatar";
import { useFolderTree } from "@renderer/shared/hooks/useFolderTree";
import { useUiStore, type ProjectsLayout } from "@renderer/store/ui.store";
import { FOLDER_DRAG_TYPE } from "@renderer/shared/utils/dragAndDrop";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { getLatestActivity } from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";

const PREVIEW_COUNT = 4;

type FolderProps = {
	folder: FolderType;
	health: ProjectsHealth;
	onDelete: (id: FolderType["id"], deleteContents: boolean) => void;
	onEdit: (folder: FolderType) => void;
	onOpenAll: (folder: FolderType) => void;
	onDropProject: (projectId: Project["id"], folder: FolderType) => void;
	onDropFolder: (folderId: FolderType["id"], folder: FolderType) => void;
	layout?: ProjectsLayout;
	/** Показывать путь к папке — в результатах поиска, где папки разных уровней вперемешку */
	showPath?: boolean;
};

const stop = (e: React.SyntheticEvent): void => e.stopPropagation();

/** Стеки проектов папки без повторов: React, Go, Vue… */
const StackPreview: FC<{ projects: Project[]; health: ProjectsHealth }> = ({ projects, health }) => {
	const stacks = [...new Set(projects.flatMap((project) => health[project.id]?.stacks ?? []))].slice(0, PREVIEW_COUNT);

	return (
		<div className="folder-card__stacks">
			{stacks.map((stack) => (
				<StackAvatar key={stack} stacks={[stack]} name={stack} size="sm" />
			))}
		</div>
	);
};

/** «6 проектов · 2 папки» — с учётом вложенных */
const formatContents = (projects: number, folders: number): string => {
	const parts = [
		projects ? `${projects} ${pluralize(projects, ["проект", "проекта", "проектов"])}` : "",
		folders ? `${folders} ${pluralize(folders, ["папка", "папки", "папок"])}` : "",
	].filter(Boolean);
	return parts.join(" · ") || "Пусто";
};

export const Folder: FC<FolderProps> = ({ folder, health, onDelete, onEdit, onOpenAll, onDropProject, onDropFolder, layout = "grid", showPath = false }) => {
	const navigate = useNavigate();
	const tree = useFolderTree();
	const draggingFolderId = useUiStore((s) => s.draggingFolderId);
	const setDraggingFolderId = useUiStore((s) => s.setDraggingFolderId);
	const [deleteContents, setDeleteContents] = useState(false);

	const projects = tree.projectsIn(folder.id);
	const subfolders = tree.childrenOf(folder.id);
	const count = projects.length;
	const lastActivity = getLatestActivity(projects);
	const contents = formatContents(count, subfolders.length);
	const parent = tree.folders.find((f) => f.id === folder.parentId);
	const hasContents = count > 0 || subfolders.length > 0;
	const description = showPath && parent ? `в ${tree.pathLabel(parent.id)}` : folder.description;
	const subtitle = [description, contents].filter(Boolean).join(" · ");

	const actions = (
		<>
			<CardAction
				title={count ? "Открыть все проекты в IDE" : "В папке нет проектов"}
				icon={<Layers size={15} strokeWidth={1.9} />}
				variant="primary"
				disabled={!count}
				onClick={() => onOpenAll(folder)}
			/>
			<CardAction title="Редактировать" icon={<Pencil size={15} strokeWidth={1.9} />} onClick={() => onEdit(folder)} />
		</>
	);

	const deleteConfirm: DeleteConfirm = {
		title: "Удаление папки",
		description: (
			<div className="folder-delete">
				<div>Удалить папку «{folder.name}»?</div>
				{hasContents && (
					<label className="folder-delete__option">
						<Switch size="small" checked={deleteContents} onChange={setDeleteContents} />
						<span>
							{deleteContents
								? `Вместе с содержимым: ${contents}`
								: `Содержимое переедет ${parent ? `в «${parent.name}»` : "на верхний уровень"}`}
						</span>
					</label>
				)}
			</div>
		),
		onConfirm: () => onDelete(folder.id, deleteContents),
		onOpenChange: (open) => open && setDeleteContents(false),
	};

	const dragProps = {
		draggable: true,
		onDragStart: (e: React.DragEvent) => {
			e.dataTransfer.setData(FOLDER_DRAG_TYPE, folder.id);
			e.dataTransfer.effectAllowed = "move";
			setDraggingFolderId(folder.id);
		},
		onDragEnd: () => setDraggingFolderId(null),
	};

	const wrap = (content: ReactNode): ReactNode => (
		<ProjectDropZone
			onDropProject={(projectId) => onDropProject(projectId, folder)}
			accepts={(projectId) => !projects.some((p) => p.id === projectId && p.folderId === folder.id)}
			onDropFolder={(folderId) => onDropFolder(folderId, folder)}
			acceptsFolder={(folderId) =>
				folderId !== folder.id && tree.folders.find((f) => f.id === folderId)?.parentId !== folder.id && tree.canMove(folderId, folder.id)
			}
		>
			<div className={`folder-drag ${draggingFolderId === folder.id ? "folder-drag--dragging" : ""}`} {...dragProps}>
				{content}
			</div>
		</ProjectDropZone>
	);

	if (layout === "list") {
		return wrap(
			<div className="folder-row" onClick={() => navigate(`/folder/${folder.id}`)}>
				<span className="folder-card__icon folder-card__icon--sm">
					<FolderIcon size={16} strokeWidth={1.8} />
				</span>
				<div className="folder-row__main">
					<div className="folder-row__name" title={folder.name}>{folder.name}</div>
					<div className="folder-card__description">{description || "Без описания"}</div>
				</div>
				{count > 0 && <StackPreview projects={projects} health={health} />}
				<span className="folder-row__count">{contents}</span>
				<span className="folder-row__activity">{lastActivity ? formatRelativeTime(lastActivity) : ""}</span>
				<div className="folder-row__actions" onClick={stop} onDoubleClick={stop}>
					{actions}
					<DeleteAction {...deleteConfirm} />
				</div>
			</div>,
		);
	}

	return wrap(
		<CardShell
			className="folder-card"
			onClick={() => navigate(`/folder/${folder.id}`)}
			actions={actions}
			deleteConfirm={deleteConfirm}
		>
			<div className="folder-card__head">
				<span className="folder-card__icon">
					<FolderIcon size={20} strokeWidth={1.8} />
				</span>
				<div className="folder-card__titles">
					<div className="folder-card__name" title={folder.name}>{folder.name}</div>
					<div className="folder-card__description" title={subtitle}>{subtitle}</div>
				</div>
			</div>
			{(count > 0 || lastActivity) && (
				<div className="folder-card__footer">
					{count > 0 && <StackPreview projects={projects} health={health} />}
					{lastActivity && <span className="folder-card__activity">{formatRelativeTime(lastActivity)}</span>}
				</div>
			)}
		</CardShell>,
	);
};
