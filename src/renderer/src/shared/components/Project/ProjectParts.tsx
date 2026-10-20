import { FC } from "react";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import { Clock, Folder as FolderIcon, Link2, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProjectHealth } from "@common/api/api.types";
import type { Folder, Project } from "@schemas/store.schema";
import { buildTaskUrl } from "@common/utils/taskTracker";
import { formatFolderPath, resolveTaskTrackerUrl } from "@common/utils/folderTree";
import { useAppStore } from "@renderer/store/app.store";
import { BranchSwitcher } from "@renderer/shared/components/BranchSwitcher/BranchSwitcher";
import { GitBadge } from "@renderer/shared/components/UI/GitBadge/GitBadge";
import { formatDateTime, formatRelativeTime } from "@renderer/shared/utils/relativeTime";

const stop = (e: React.SyntheticEvent): void => e.stopPropagation();

/** Ссылка на папку проекта, когда проект показан вне её */
export const FolderChip: FC<{ folder: Pick<Folder, "id" | "name"> }> = ({ folder }) => {
	const navigate = useNavigate();
	const folders = useAppStore((s) => s.folders);
	const path = formatFolderPath(folders, folder.id);

	return (
		<Tooltip title={path !== folder.name ? path : undefined}>
			<button
				type="button"
				className="folder-chip"
				onClick={(e) => {
					e.stopPropagation();
					navigate(`/folder/${folder.id}`);
				}}
				onDoubleClick={stop}
			>
				<FolderIcon size={12} strokeWidth={2} />
				<span>{folder.name}</span>
			</button>
		</Tooltip>
	);
};

/** Последнее открытие из лаунчера, а если его не было — последнее изменение файлов */
export const ProjectDate: FC<{ project: Project }> = ({ project }) => {
	const opened = project.lastOpenedAt;

	if (!opened && !project.lastModified) {
		return null;
	}

	return (
		<Tooltip
			title={
				<div>
					{opened && <div>Открыт из Hangar: {formatDateTime(opened)}</div>}
					<div>Файлы изменены: {formatDateTime(project.lastModified) || "неизвестно"}</div>
				</div>
			}
		>
			<span className="project-date">
				<Clock size={12} strokeWidth={2} />
				{opened ? `открыт ${formatRelativeTime(opened)}` : `изменён ${formatRelativeTime(project.lastModified)}`}
			</span>
		</Tooltip>
	);
};

export const TaskLink: FC<{ project: Project }> = ({ project }) => {
	const defaultTrackerUrl = useAppStore((s) => s.settings.common.taskTrackerUrl);
	const folders = useAppStore((s) => s.folders);
	const trackerUrl = resolveTaskTrackerUrl(folders, project.folderId, defaultTrackerUrl);
	const url = buildTaskUrl(trackerUrl, project.taskPath);

	if (!project.taskPath) {
		return null;
	}

	return url ? (
		<a className="task-link" href={url} target="_blank" rel="noreferrer" onClick={stop} onDoubleClick={stop}>
			<Link2 size={12} strokeWidth={2} />
			{project.taskPath}
		</a>
	) : (
		<Tooltip title="Укажите адрес таск-трекера в настройках">
			<span className="task-link task-link--disabled">
				<Link2 size={12} strokeWidth={2} />
				{project.taskPath}
			</span>
		</Tooltip>
	);
};

/** Ветка и статус git. Пока статус не проверен — скелетон */
export const GitLine: FC<{ project: Project; health?: ProjectHealth }> = ({ project, health }) => {
	if (!health) {
		return (
			<>
				<span className="skeleton" style={{ width: 72, height: 22 }} />
				<span className="skeleton" style={{ width: 34, height: 22 }} />
			</>
		);
	}

	if (!health.git) {
		return <span className="no-git">без git</span>;
	}

	return (
		<>
			<BranchSwitcher projectId={project.id} branch={health.git.branch} changes={health.git.changes} />
			<GitBadge git={health.git} />
		</>
	);
};

export const MissingNotice: FC<{ onFix: () => void }> = ({ onFix }) => (
	<div className="missing-notice">
		<TriangleAlert size={14} strokeWidth={2} />
		<span>Папка не найдена</span>
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onFix();
			}}
			onDoubleClick={stop}
		>
			Исправить путь
		</button>
	</div>
);
