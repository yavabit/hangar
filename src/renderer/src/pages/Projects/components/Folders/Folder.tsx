import { FC, useState } from "react";
import { Switch } from "antd";
import { Folder as FolderIcon, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProjectsHealth } from "@common/api/api.types";
import { Folder as FolderType, Project } from "@schemas/store.schema";
import { CardShell } from "@renderer/shared/components/UI/CardShell/CardShell";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";
import { ProjectDropZone } from "@renderer/shared/components/ProjectDropZone/ProjectDropZone";
import { StackAvatar } from "@renderer/shared/components/StackAvatar/StackAvatar";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { getLatestActivity } from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";

const PREVIEW_COUNT = 4;

type FolderProps = {
	folder: FolderType;
	projects: Project[];
	health: ProjectsHealth;
	onDelete: (id: FolderType["id"], deleteAllProjects: boolean) => void;
	onEdit: (folder: FolderType) => void;
	onDropProject: (projectId: Project["id"], folder: FolderType) => void;
};

export const Folder: FC<FolderProps> = ({ folder, projects, health, onDelete, onEdit, onDropProject }) => {
	const navigate = useNavigate();
	const [deleteProjects, setDeleteProjects] = useState(false);

	const count = projects.length;
	const lastActivity = getLatestActivity(projects);

	return (
		<ProjectDropZone
			onDropProject={(projectId) => onDropProject(projectId, folder)}
			accepts={(projectId) => !projects.some((p) => p.id === projectId)}
		>
			<CardShell
				className="folder-card"
				onClick={() => navigate(`/folder/${folder.id}`)}
				actions={<CardAction title="Редактировать" icon={<Pencil size={15} strokeWidth={1.9} />} onClick={() => onEdit(folder)} />}
				deleteConfirm={{
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
				}}
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
					{count > 0 && (
						<div className="folder-card__stacks">
							{projects.slice(0, PREVIEW_COUNT).map((project) => (
								<StackAvatar key={project.id} stack={health[project.id]?.stack} name={project.name} size="sm" />
							))}
						</div>
					)}
					<span>
						{count ? `${count} ${pluralize(count, ["проект", "проекта", "проектов"])}` : "Пусто"}
					</span>
					{lastActivity && <span className="folder-card__activity">{formatRelativeTime(lastActivity)}</span>}
				</div>
			</CardShell>
		</ProjectDropZone>
	);
};
