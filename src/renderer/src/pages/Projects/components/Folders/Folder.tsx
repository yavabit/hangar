import { FC, ReactNode, useState } from "react";
import { Switch } from "antd";
import { Folder as FolderIcon, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProjectsHealth } from "@common/api/api.types";
import { Folder as FolderType, Project } from "@schemas/store.schema";
import { CardShell } from "@renderer/shared/components/UI/CardShell/CardShell";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";
import { DeleteAction, type DeleteConfirm } from "@renderer/shared/components/UI/DeleteAction/DeleteAction";
import { ProjectDropZone } from "@renderer/shared/components/ProjectDropZone/ProjectDropZone";
import { StackAvatar } from "@renderer/shared/components/StackAvatar/StackAvatar";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { getLatestActivity } from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";
import type { ProjectsLayout } from "@renderer/store/ui.store";

const PREVIEW_COUNT = 4;

type FolderProps = {
	folder: FolderType;
	projects: Project[];
	health: ProjectsHealth;
	onDelete: (id: FolderType["id"], deleteAllProjects: boolean) => void;
	onEdit: (folder: FolderType) => void;
	onDropProject: (projectId: Project["id"], folder: FolderType) => void;
	layout?: ProjectsLayout;
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

export const Folder: FC<FolderProps> = ({ folder, projects, health, onDelete, onEdit, onDropProject, layout = "grid" }) => {
	const navigate = useNavigate();
	const [deleteProjects, setDeleteProjects] = useState(false);

	const count = projects.length;
	const lastActivity = getLatestActivity(projects);
	const countLabel = count ? `${count} ${pluralize(count, ["проект", "проекта", "проектов"])}` : "Пусто";
	const editAction = <CardAction title="Редактировать" icon={<Pencil size={15} strokeWidth={1.9} />} onClick={() => onEdit(folder)} />;

	const deleteConfirm: DeleteConfirm = {
		title: "Удаление папки",
		description: (
			<div className="folder-delete">
				<div>Удалить папку «{folder.name}»?</div>
				{count > 0 && (
					<label className="folder-delete__option">
						<Switch size="small" checked={deleteProjects} onChange={setDeleteProjects} />
						<span>{deleteProjects ? "Проекты тоже будут удалены" : "Проекты останутся в общем списке"}</span>
					</label>
				)}
			</div>
		),
		onConfirm: () => onDelete(folder.id, deleteProjects),
		onOpenChange: (open) => open && setDeleteProjects(false),
	};

	const wrap = (content: ReactNode): ReactNode => (
		<ProjectDropZone
			onDropProject={(projectId) => onDropProject(projectId, folder)}
			accepts={(projectId) => !projects.some((p) => p.id === projectId)}
		>
			{content}
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
					<div className="folder-card__description">{folder.description || "Без описания"}</div>
				</div>
				{count > 0 && <StackPreview projects={projects} health={health} />}
				<span className="folder-row__count">{countLabel}</span>
				<span className="folder-row__activity">{lastActivity ? formatRelativeTime(lastActivity) : ""}</span>
				<div className="folder-row__actions" onClick={stop} onDoubleClick={stop}>
					{editAction}
					<DeleteAction {...deleteConfirm} />
				</div>
			</div>,
		);
	}

	return wrap(
		<CardShell
			className="folder-card"
			onClick={() => navigate(`/folder/${folder.id}`)}
			actions={editAction}
			deleteConfirm={deleteConfirm}
		>
			<div className="folder-card__head">
				<span className="folder-card__icon">
					<FolderIcon size={20} strokeWidth={1.8} />
				</span>
				<div className="folder-card__titles">
					<div className="folder-card__name" title={folder.name}>{folder.name}</div>
					<div className="folder-card__description">{folder.description || "Без описания"}</div>
				</div>
			</div>
			<div className="folder-card__footer">
				{count > 0 && <StackPreview projects={projects} health={health} />}
				<span>{countLabel}</span>
				{lastActivity && <span className="folder-card__activity">{formatRelativeTime(lastActivity)}</span>}
			</div>
		</CardShell>,
	);
};
