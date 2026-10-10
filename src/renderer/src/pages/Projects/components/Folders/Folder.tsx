import {
	CardTitle,
	ProjectCardWrapper,
} from "@renderer/shared/components/UI/ProjectCardWrapper/ProjectCardWrapper";
import { Avatar, CardMetaProps, Tooltip, Typography } from "antd";
import { Meta } from "antd/es/list/Item";
import { FolderOutlined } from "@ant-design/icons";
import { FC } from "react";
import {
	EditOutlined,
	ClockCircleOutlined,
	FolderOpenOutlined,
} from "@ant-design/icons";
import { Folder as FolderType } from "@schemas/store.schema";
import { useNavigate } from "react-router-dom";

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
	lastDate: FolderType["lastDate"];
};

const FolderDescription: FC<FolderDescriptionProps> = ({
	description,
	lastDate,
}) => {
	return (
		<div>
			{description && (
				<div>
					<Typography.Text type="secondary">{description}</Typography.Text>
				</div>
			)}
			{lastDate && (
				<div>
					<Typography.Text type="secondary">
						<ClockCircleOutlined /> 0ч назад
					</Typography.Text>
				</div>
			)}
		</div>
	);
};

type FolderProps = {
	folder: FolderType;
	onDelete: (id: FolderType["id"], deleteAllProjects: boolean) => void;
	onEdit: (folder: FolderType) => void;
};

export const Folder: FC<FolderProps> = ({ folder, onDelete, onEdit }) => {

	const navigate = useNavigate();

	const handleEdit: React.MouseEventHandler<HTMLSpanElement> = (e) => {
		e.stopPropagation();
		onEdit && onEdit(folder);
	}

	const actions = [
		<div key={"count"}>3 проекта</div>,
		<Tooltip key="open" title="Открыть в проводнике">
			<FolderOpenOutlined style={{ color: "#a15a08" }} />
		</Tooltip>,
		<Tooltip key="edit" title="Редактировать">
			<EditOutlined style={{ color: "#4566d1" }} onClick={handleEdit} />
		</Tooltip>,
	];

	const sharedCardMetaProps: CardMetaProps = {
		avatar: <FolderIcon />,
		description: (
			<FolderDescription
				description={folder?.description}
				lastDate={folder?.lastDate}
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
			onCardClick={() => navigate(`/folder/${folder.id}`)}
		>
			<Meta
				{...sharedCardMetaProps}
				title={<CardTitle title={folder.name} />}
			/>
		</ProjectCardWrapper>
	);
};
