import {
	CardTitle,
	ProjectCardWrapper,
} from "@renderer/shared/components/UI/ProjectCardWrapper/ProjectCardWrapper";
import { Avatar, CardMetaProps, Typography } from "antd";
import { Meta } from "antd/es/list/Item";
import { FC } from "react";
import {
	EditOutlined,
	ClockCircleOutlined,
	FolderOpenOutlined,
	FolderOutlined,
	FolderViewOutlined,
	GithubOutlined,
	GitlabOutlined,
	BranchesOutlined,
} from "@ant-design/icons";
import { GlobeIcon } from "@renderer/shared/assets/icons/globe.icon";
import { CodeIcon } from "@renderer/shared/assets/icons/code.icon";
import { GitStatus } from "@renderer/shared/components/UI/GitStatus/GitStatus";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { getGitHost } from "@renderer/shared/utils/gitUrl";

import "./Projects.scss";
import { Project as ProjectType } from "@schemas/store.schema";
import { FavoriteStar } from "../UI/FavoriteStar/FavoriteStar";

type ProjectProps = {
	item: ProjectType;
	folderName?: string;
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

const ProjectDescription: FC<Pick<ProjectProps, "item" | "folderName">> = ({ item, folderName }) => {
	return (
		<div style={{ width: "100%" }}>
			<div className="project-card__line">
				<FolderViewOutlined />
				<Typography.Text ellipsis={{ tooltip: item.path }} className="project-card__text">
					{item.path}
				</Typography.Text>
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
			</div>
			<div className="project-card__line">
				<Typography.Text type="secondary">
					<ClockCircleOutlined /> {formatRelativeTime(item.lastOpened)}
				</Typography.Text>
				{folderName && (
					<Typography.Text type="secondary" ellipsis style={{ marginLeft: "auto", maxWidth: "50%" }}>
						<FolderOutlined /> {folderName}
					</Typography.Text>
				)}
			</div>
		</div>
	);
};

export const Project: FC<ProjectProps> = ({item, folderName, onDelete, onFavorite, handleOpenIde, handleOpenFolder, handleEdit}) => {

	const actions = [
		<CardAction
			key="open_ide"
			title="Открыть в IDE"
			icon={<CodeIcon />}
			color="#13a8a8"
			onClick={() => handleOpenIde?.(item.id)}
		/>,
		<GitStatus key="git" gitUrl={item.gitUrl} status={item.gitStatus} />,
		<CardAction
			key="open_folder"
			title="Открыть в проводнике"
			icon={<FolderOpenOutlined />}
			color="#a15a08"
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
		description: <ProjectDescription item={item} folderName={folderName} />,
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
			className="project-card"
		>
			<Meta {...sharedCardMetaProps} />
		</ProjectCardWrapper>
	);
};
