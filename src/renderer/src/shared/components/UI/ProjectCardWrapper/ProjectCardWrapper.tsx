import { FC, ReactNode, useState } from "react";
import { Button, Card, Popconfirm, Switch, Typography } from "antd";
import type { CardProps } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import styles from "./ProjectCardWrapper.module.scss";

const { Text } = Typography;

export const CardTitle: FC<{ title: string }> = ({ title }) => (
	<div style={{ fontSize: 20, fontWeight: 500 }}>{title}</div>
);

type ProjectCardWrapperProps = {
	children?: ReactNode;
	sharedCardProps?: CardProps;
	deletable?: boolean;
	onDelete?: (deleteFolderProjects: boolean) => void;
	onCardClick?: () => void;
	className?: string;
	type?: "project" | "folder";
	name?: string;
};

const DeleteConfirmDescription = ({ type, name, onAllDelete }) => {
	if (type === "project") {
		return `Вы действительно хотите удалить проект «${name}»?`;
	}

	if (type === "folder") {
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				<div>
					<Text>
						Вы действительно хотите удалить папку <Text strong>«{name}»</Text>?
					</Text>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						padding: "8px 12px",
						background: "#f5f5f5",
						borderRadius: 8,
					}}
				>
					<Switch size="small" onChange={onAllDelete} />
					<Text type="secondary">Удалить все проекты в папке</Text>
				</div>
			</div>
		);
	}
};

export const ProjectCardWrapper: FC<ProjectCardWrapperProps> = ({
	children,
	sharedCardProps,
	deletable = false,
	onDelete,
	onCardClick,
	className,
	type,
	name
}) => {

	const [allDelete, setAllDelete] = useState(false);

	const handleDelete = (e) => {
		e.stopPropagation();
		onDelete && onDelete(allDelete);
	}

	return (
		<Card
			{...sharedCardProps}
			variant="borderless"
			className={styles.card + (className ? ` ${className}` : "")}
			onClick={onCardClick}
		>
			{deletable && (
				<Popconfirm
					title={`Удаление ${type == "folder" ? "папки" : "проекта"}`}
					description={<DeleteConfirmDescription type={type} name={name} onAllDelete={setAllDelete}/>}
					onConfirm={handleDelete}
					okText="Да"
					cancelText="Нет"
				>
					<Button
						type="text"
						icon={<DeleteOutlined />}
						className={styles.deleteButton}
						onClick={(e) => e.stopPropagation()}
					/>
				</Popconfirm>
			)}
			{children}
		</Card>
	);
};
