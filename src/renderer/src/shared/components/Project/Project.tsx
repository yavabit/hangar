import {
	CardTitle,
	ProjectCardWrapper,
} from "@renderer/shared/components/UI/ProjectCardWrapper/ProjectCardWrapper";
import { Avatar, CardMetaProps, Tag, Tooltip, Typography } from "antd";
import { Meta } from "antd/es/list/Item";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
	EditOutlined,
	ClockCircleOutlined,
	ExportOutlined,
	FolderOpenOutlined,
	FolderOutlined,
	FolderViewOutlined,
	GithubOutlined,
	GitlabOutlined,
	BranchesOutlined,
	LinkOutlined,
	WarningOutlined,
} from "@ant-design/icons";
import { GlobeIcon } from "@renderer/shared/assets/icons/globe.icon";
import { CodeIcon } from "@renderer/shared/assets/icons/code.icon";
import { GitStatus } from "@renderer/shared/components/UI/GitStatus/GitStatus";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";
import { ProjectPath } from "@renderer/shared/components/ProjectPath/ProjectPath";
import { formatDateTime, formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { getGitHost } from "@renderer/shared/utils/gitUrl";
import { BranchSwitcher } from "@renderer/shared/components/BranchSwitcher/BranchSwitcher";
import { useAppStore } from "@renderer/store/app.store";
import { buildTaskUrl } from "@common/utils/taskTracker";
import type { ProjectHealth } from "@common/api/api.types";

import "./Projects.scss";
import { Folder, Project as ProjectType } from "@schemas/store.schema";
import { FavoriteStar } from "../UI/FavoriteStar/FavoriteStar";

const MISSING_HINT = "Папка не найдена. Исправьте путь в настройках проекта";

type ProjectProps = {
	item: ProjectType;
	/** Папка проекта — показываем, когда проект виден вне своей папки */
	folder?: Pick<Folder, "id" | "name">;
	health?: ProjectHealth;
	onDelete?: (projectId: ProjectType["id"]) => void;
	onFavorite?: (projectId: ProjectType["id"]) => void;
	handleOpenIde?: (projectId: ProjectType["id"]) => void;
	handleOpenFolder?: (projectId: ProjectType["id"]) => void;
	handleEdit?: (projectId: ProjectType["id"]) => void;
}

const ProjectIcon: FC = () => (
	<Avatar
		className="folder-icon"
		shape="square"
		icon={<GlobeIcon />}
		size={40}
	/>
);

const GitHostIcon: FC<{ gitUrl?: string }> = ({ gitUrl }) => {
	switch (getGitHost(gitUrl)) {
		case "github":
			return <GithubOutlined />;
		case "gitlab":
			return <GitlabOutlined />;
		default:
			return <BranchesOutlined />;
	}
};

const stopDoubleClick = (e: React.MouseEvent): void => e.stopPropagation();

const ProjectDescription: FC<Pick<ProjectProps, "item" | "folder" | "health">> = ({ item, folder, health }) => {
	const navigate = useNavigate();
	const taskTrackerUrl = useAppStore((s) => s.settings.common.taskTrackerUrl);

	const missing = health?.exists === false;
	const git = missing ? null : health?.git;
	const taskUrl = buildTaskUrl(taskTrackerUrl, item.taskPath);

	return (
		<div style={{ width: "100%" }}>
			{(missing || folder) && (
				<div className="project-card__badges">
					{missing && (
						<Tag color="error" icon={<WarningOutlined />} bordered={false}>
							Папка не найдена
						</Tag>
					)}
					{folder && (
						<Tooltip title="Открыть папку">
							<Tag
								icon={<FolderOutlined />}
								bordered={false}
								className="project-card__folder"
								onClick={(e) => {
									e.stopPropagation();
									navigate(`/folder/${folder.id}`);
								}}
								onDoubleClick={stopDoubleClick}
							>
								{folder.name}
							</Tag>
						</Tooltip>
					)}
				</div>
			)}
			<div className="project-card__line">
				<FolderViewOutlined />
				<ProjectPath path={item.path} missing={missing} />
			</div>
			<div className="project-card__line">
				<GitHostIcon gitUrl={item.gitUrl} />
				<Typography.Text
					ellipsis={{ tooltip: item.gitUrl }}
					type={item.gitUrl ? undefined : "secondary"}
					className="project-card__text"
				>
					{item.gitUrl || "Репозиторий не указан"}
				</Typography.Text>
				{git && <BranchSwitcher projectId={item.id} branch={git.branch} changes={git.changes} />}
			</div>
			{item.taskPath && (
				<div className="project-card__line">
					<LinkOutlined />
					{taskUrl ? (
						<Typography.Link
							href={taskUrl}
							target="_blank"
							ellipsis
							className="project-card__text"
							onClick={(e) => e.stopPropagation()}
							onDoubleClick={stopDoubleClick}
						>
							{item.taskPath}
						</Typography.Link>
					) : (
						<Tooltip title="Укажите адрес таск-трекера в настройках">
							<Typography.Text type="secondary" ellipsis className="project-card__text">
								{item.taskPath}
							</Typography.Text>
						</Tooltip>
					)}
				</div>
			)}
			<div className="project-card__line project-card__dates">
				{item.lastOpenedAt && (
					<>
						<Tooltip title={`Открыт из лаунчера: ${formatDateTime(item.lastOpenedAt)}`}>
							<span className="project-card__date">
								<ExportOutlined /> {formatRelativeTime(item.lastOpenedAt)}
							</span>
						</Tooltip>
						<span className="project-card__date-separator">·</span>
					</>
				)}
				<Tooltip title={`Последнее изменение файлов: ${formatDateTime(item.lastModified)}`}>
					<span className="project-card__date">
						<ClockCircleOutlined /> изменён {formatRelativeTime(item.lastModified)}
					</span>
				</Tooltip>
			</div>
		</div>
	);
};

export const Project: FC<ProjectProps> = ({item, folder, health, onDelete, onFavorite, handleOpenIde, handleOpenFolder, handleEdit}) => {
	const missing = health?.exists === false;

	const actions = [
		<CardAction
			key="open_ide"
			title={missing ? MISSING_HINT : "Открыть в IDE (или двойной клик по карточке)"}
			icon={<CodeIcon />}
			color="#13a8a8"
			disabled={missing}
			onClick={() => handleOpenIde?.(item.id)}
		/>,
		<GitStatus key="git" gitUrl={item.gitUrl} git={missing ? null : health?.git} />,
		<CardAction
			key="open_folder"
			title={missing ? MISSING_HINT : "Открыть в проводнике"}
			icon={<FolderOpenOutlined />}
			color="#a15a08"
			disabled={missing}
			onClick={() => handleOpenFolder?.(item.id)}
		/>,
		<CardAction
			key="edit"
			title="Редактировать"
			icon={<EditOutlined />}
			color="#4566d1"
			onClick={() => handleEdit?.(item.id)}
		/>,
	];

	const sharedCardMetaProps: CardMetaProps = {
		avatar: <ProjectIcon />,
		description: <ProjectDescription item={item} folder={folder} health={health} />,
	};

	return (
		<ProjectCardWrapper
			sharedCardProps={{
				actions,
				title: (
					<div className="project-title__with-lnk">
						{onFavorite && <FavoriteStar isFavorite={item.isFavorite} onFavorite={onFavorite} itemId={item.id} className="fav-ico-lnk-wrapper"/>}
						<CardTitle title={item.name} />
					</div>
				),
			}}
			deletable
			type="project"
			name={item.name}
			onDelete={() => onDelete?.(item.id)}
			onCardDoubleClick={missing ? undefined : () => handleOpenIde?.(item.id)}
			className={`project-card ${missing ? "project-card--missing" : ""}`}
		>
			<Meta {...sharedCardMetaProps} />
		</ProjectCardWrapper>
	);
};
