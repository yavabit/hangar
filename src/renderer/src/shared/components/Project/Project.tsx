import {
	CardTitle,
	ProjectCardWrapper,
} from "@renderer/shared/components/UI/ProjectCardWrapper/ProjectCardWrapper";
import { Avatar, CardMetaProps, Tooltip, Typography } from "antd";
import { Meta } from "antd/es/list/Item";
import { FC } from "react";
import {
	EditOutlined,
	ClockCircleOutlined,
	FolderOpenOutlined,
	FolderViewOutlined,
	GitlabOutlined,
} from "@ant-design/icons";
import { GlobeIcon } from "@renderer/shared/assets/icons/globe.icon";
import { CodeIcon } from "@renderer/shared/assets/icons/code.icon";
import { GitStatus } from "@renderer/shared/components/UI/GitStatus/GitStatus";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";

import "./Projects.scss";
import { Project as ProjectType } from "@schemas/store.schema";
import { FavoriteStar } from "../UI/FavoriteStar/FavoriteStar";

type ProjectProps = {
	item: ProjectType;
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



const ProjectDescription: FC<Pick<ProjectProps, "item">> = ({item}) => {
	return (
		<div style={{ width: "100%" }}>
			<div>
				<Typography.Text ellipsis={{ tooltip: true }} style={{ width: "100%" }}>
					<FolderViewOutlined style={{ marginRight: 8 }} />
					<span>{item.path}</span>
				</Typography.Text>
			</div>
			<div>
				<Typography.Text ellipsis={{ tooltip: true }} style={{ width: "100%" }}>
					<GitlabOutlined style={{ marginRight: 8 }} />
					<span>{item.gitUrl ?? "-"}</span>
				</Typography.Text>
			</div>
			<div>
				<Typography.Text type="secondary">
					<ClockCircleOutlined /> {formatRelativeTime(item.lastOpened)}
				</Typography.Text>
			</div>
		</div>
	);
};

export const Project: FC<ProjectProps> = ({item, onDelete, onFavorite, handleOpenIde, handleOpenFolder, handleEdit}) => {

	const actions = [
		<Tooltip key="open_ide" title="Открыть в IDE">
			<div onClick={() => handleOpenIde && handleOpenIde(item.id)}>
				<CodeIcon />
			</div>
		</Tooltip>,
		<GitStatus key={"git"} status="" />,
		<Tooltip key="open_folder" title="Открыть в проводнике">
			<FolderOpenOutlined style={{ color: "#a15a08" }} onClick={() => handleOpenFolder && handleOpenFolder(item.id)} />
		</Tooltip>,
		<Tooltip key="edit" title="Редактировать">
			<EditOutlined style={{ color: "#4566d1" }} onClick={() => handleEdit && handleEdit(item.id)} />
		</Tooltip>,
	];

	const sharedCardMetaProps: CardMetaProps = {
		avatar: <ProjectIcon />,
		description: <ProjectDescription item={item}/>,
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
			onDelete={() => onDelete && onDelete(item.id)}
			className="project-card"
		>
			<Meta {...sharedCardMetaProps} />
		</ProjectCardWrapper>
	);
};
