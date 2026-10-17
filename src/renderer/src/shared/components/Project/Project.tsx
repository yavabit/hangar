import { FC } from "react";
import { STACKS } from "@common/utils/stacks";
import type { ProjectHealth } from "@common/api/api.types";
import { Folder, Project as ProjectType } from "@schemas/store.schema";
import { CardShell } from "@renderer/shared/components/UI/CardShell/CardShell";
import { FavoriteStar } from "@renderer/shared/components/UI/FavoriteStar/FavoriteStar";
import { ProjectPath } from "@renderer/shared/components/ProjectPath/ProjectPath";
import { StackAvatar } from "@renderer/shared/components/StackAvatar/StackAvatar";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { useUiStore } from "@renderer/store/ui.store";
import { ProjectActions } from "./ProjectActions";
import { FolderChip, GitLine, MissingNotice, ProjectDate, TaskLink } from "./ProjectParts";
import { getProjectDeleteConfirm } from "./deleteConfirm";

import "./Projects.scss";

export type ProjectViewProps = {
	item: ProjectType;
	/** Папка проекта — показываем, когда проект виден вне своей папки */
	folder?: Pick<Folder, "id" | "name">;
	health?: ProjectHealth;
	onEdit: (projectId: ProjectType["id"]) => void;
};

/** Карточка проекта: действия появляются при наведении, двойной клик открывает в IDE */
export const Project: FC<ProjectViewProps> = ({ item, folder, health, onEdit }) => {
	const { toggleFavorite, removeProject, openProjectInIde } = useProjects();
	const launching = useUiStore((s) => s.launchingProjectId === item.id);

	const missing = health?.exists === false;
	const stackLabel = health?.stack ? STACKS[health.stack].label : "Проект";

	return (
		<CardShell
			className={`project-card ${missing ? "project-card--missing" : ""} ${launching ? "project-card--launching" : ""}`}
			actions={<ProjectActions project={item} health={health} onEdit={() => onEdit(item.id)} />}
			deleteConfirm={getProjectDeleteConfirm(item, () => void removeProject(item.id))}
			onDoubleClick={missing ? undefined : () => void openProjectInIde(item.id)}
		>
			<header className="project-card__head">
				<StackAvatar stack={health?.stack} name={item.name} />
				<div className="project-card__title">
					<div className="project-card__name">
						<span className="project-card__name-text" title={item.name}>{item.name}</span>
						<FavoriteStar isFavorite={item.isFavorite} onFavorite={toggleFavorite} itemId={item.id} />
					</div>
					<div className="project-card__meta">
						{health ? <span>{stackLabel}</span> : <span className="skeleton" style={{ width: 54, height: 12 }} />}
						{folder && (
							<>
								<span className="project-card__dot">·</span>
								<FolderChip folder={folder} />
							</>
						)}
					</div>
				</div>
			</header>

			<div className="project-card__path">
				<ProjectPath path={item.path} missing={missing} />
			</div>

			{missing ? (
				<MissingNotice onFix={() => onEdit(item.id)} />
			) : (
				<div className="project-card__status">
					<GitLine project={item} health={health} />
					<span className="project-card__spacer" />
					<ProjectDate project={item} />
				</div>
			)}

			{item.taskPath && <TaskLink project={item} />}
		</CardShell>
	);
};
