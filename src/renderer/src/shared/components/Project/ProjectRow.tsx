import { FC, memo } from "react";
import { DeleteAction } from "@renderer/shared/components/UI/DeleteAction/DeleteAction";
import { FavoriteStar } from "@renderer/shared/components/UI/FavoriteStar/FavoriteStar";
import { ProjectPath } from "@renderer/shared/components/ProjectPath/ProjectPath";
import { StackAvatar } from "@renderer/shared/components/StackAvatar/StackAvatar";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { useUiStore } from "@renderer/store/ui.store";
import type { ProjectViewProps } from "./Project";
import { getProjectDeleteConfirm } from "./deleteConfirm";
import { ProjectActions } from "./ProjectActions";
import { FolderChip, GitLine, MissingNotice, ProjectDate } from "./ProjectParts";

const stop = (e: React.SyntheticEvent): void => e.stopPropagation();

/** Строка проекта для плотного вида списком */
const ProjectRowView: FC<ProjectViewProps> = ({ item, folder, health, onEdit }) => {
	const { toggleFavorite, removeProject, openProjectInIde } = useProjects();
	const launching = useUiStore((s) => s.launchingProjectId === item.id);
	const missing = health?.exists === false;

	return (
		<div
			className={`project-row ${missing ? "project-row--missing" : ""} ${launching ? "project-row--launching" : ""}`}
			onDoubleClick={missing ? undefined : () => void openProjectInIde(item.id)}
		>
			<StackAvatar stacks={health?.stacks} name={item.name} size="sm" />
			<div className="project-row__main">
				<div className="project-row__name">
					<span title={item.name}>{item.name}</span>
					<FavoriteStar isFavorite={item.isFavorite} onFavorite={toggleFavorite} itemId={item.id} />
					{folder && <FolderChip folder={folder} />}
				</div>
				<div className="project-row__path">
					<ProjectPath path={item.path} missing={missing} />
				</div>
			</div>
			<div className="project-row__status">
				{missing ? <MissingNotice onFix={() => onEdit(item.id)} /> : <GitLine project={item} health={health} />}
			</div>
			<div className="project-row__date">
				<ProjectDate project={item} />
			</div>
			<div className="project-row__actions" onClick={stop} onDoubleClick={stop}>
				<ProjectActions project={item} health={health} onEdit={() => onEdit(item.id)} />
				<DeleteAction {...getProjectDeleteConfirm(item, () => void removeProject(item.id))} />
			</div>
		</div>
	);
};

export const ProjectRow = memo(ProjectRowView);
