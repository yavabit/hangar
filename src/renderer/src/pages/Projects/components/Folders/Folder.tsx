import {
	CardTitle,
	ProjectCardWrapper,
} from "@renderer/shared/components/UI/ProjectCardWrapper/ProjectCardWrapper";
import { CardAction, CardActionLabel } from "@renderer/shared/components/UI/CardAction/CardAction";
import { Avatar, CardMetaProps, Typography } from "antd";
import { Meta } from "antd/es/list/Item";
import { FC } from "react";
import {
	EditOutlined,
	ClockCircleOutlined,
	FolderOutlined,
} from "@ant-design/icons";
import { Folder as FolderType } from "@schemas/store.schema";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { pluralize } from "@renderer/shared/utils/pluralize";

const FolderIcon: FC = () => (
	<Avatar
		className="folder-icon"
		shape="square"
		icon={<FolderOutlined />}
		size={40}
	/>
);

type FolderDescriptionProps = {
	description: FolderType["description"];
	lastActivity?: string;
};

const FolderDescription: FC<FolderDescriptionProps> = ({
	description,
	lastActivity,
}) => {
	return (
		<div>
			<Typography.Text type="secondary" ellipsis={{ tooltip: description }} style={{ width: "100%" }}>
				{description || "Без описания"}
			</Typography.Text>
			<div>
				<Typography.Text type="secondary">
					<ClockCircleOutlined /> {lastActivity ? formatRelativeTime(lastActivity) : "Нет проектов"}
				</Typography.Text>
			</div>
		</div>
	);
};

type FolderProps = {
	folder: FolderType;
	projectsCount: number;
	lastActivity?: string;
	onDelete: (id: FolderType["id"], deleteAllProjects: boolean) => void;
	onEdit: (folder: FolderType) => void;
};

export const Folder: FC<FolderProps> = ({ folder, projectsCount, lastActivity, onDelete, onEdit }) => {

	const navigate = useNavigate();

	const actions = [
		<CardActionLabel key="count">
			{projectsCount} {pluralize(projectsCount, ["проект", "проекта", "проектов"])}
		</CardActionLabel>,
		<CardAction
			key="edit"
			title="Редактировать"
			icon={<EditOutlined />}
			color="#4566d1"
			onClick={() => onEdit(folder)}
		/>,
	];

	const sharedCardMetaProps: CardMetaProps = {
		avatar: <FolderIcon />,
		description: (
			<FolderDescription
				description={folder.description}
				lastActivity={lastActivity}
			/>
		),
	};

	return (
		<ProjectCardWrapper
			sharedCardProps={{ actions }}
			deletable
			onDelete={(deleteFolderProjects) => onDelete(folder.id, deleteFolderProjects)}
			type="folder"
			name={folder.name}
			projectsCount={projectsCount}
			onCardClick={() => navigate(`/folder/${folder.id}`)}
		>
			<Meta
				{...sharedCardMetaProps}
				title={<CardTitle title={folder.name} />}
			/>
		</ProjectCardWrapper>
	);
};
