import { FC, ReactNode, useState } from "react";
import { Button, Card, Popconfirm, Switch, Typography } from "antd";
import type { CardProps } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import styles from "./ProjectCardWrapper.module.scss";

const { Text } = Typography;

type CardType = "project" | "folder";

export const CardTitle: FC<{ title: string }> = ({ title }) => (
	<div className={styles.title} title={title}>{title}</div>
);

type ProjectCardWrapperProps = {
	children?: ReactNode;
	sharedCardProps?: CardProps;
	deletable?: boolean;
	onDelete?: (deleteFolderProjects: boolean) => void;
	onCardClick?: () => void;
	className?: string;
	type?: CardType;
	name?: string;
	projectsCount?: number;
};

type DeleteConfirmDescriptionProps = {
	type: CardType;
	name?: string;
	projectsCount: number;
	deleteProjects: boolean;
	onDeleteProjectsChange: (value: boolean) => void;
};

const DeleteConfirmDescription: FC<DeleteConfirmDescriptionProps> = ({
	type,
	name,
	projectsCount,
	deleteProjects,
	onDeleteProjectsChange,
}) => {
	if (type === "project") {
		return <Text>Вы действительно хотите удалить проект <Text strong>«{name}»</Text>?</Text>;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
			<Text>
				Вы действительно хотите удалить папку <Text strong>«{name}»</Text>?
			</Text>
			{projectsCount > 0 && (
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
					<Switch size="small" checked={deleteProjects} onChange={onDeleteProjectsChange} />
					<Text type="secondary">
						{deleteProjects
							? "Проекты из папки будут удалены"
							: "Проекты останутся в общем списке"}
					</Text>
				</div>
			)}
		</div>
	);
};

export const ProjectCardWrapper: FC<ProjectCardWrapperProps> = ({
	children,
	sharedCardProps,
	deletable = false,
	onDelete,
	onCardClick,
	className,
	type = "project",
	name,
	projectsCount = 0,
}) => {

	const [deleteProjects, setDeleteProjects] = useState(false);

	const handleDelete = (e?: React.MouseEvent<HTMLElement>): void => {
		e?.stopPropagation();
		onDelete?.(deleteProjects);
	};

	const handleOpenChange = (open: boolean): void => {
		if (open) {
			setDeleteProjects(false);
		}
	};

	return (
		<Card
			{...sharedCardProps}
			variant="borderless"
			className={`${styles.card} ${onCardClick ? styles.clickable : ""} ${className ?? ""}`}
			onClick={onCardClick}
		>
			{deletable && (
				<span onClick={(e) => e.stopPropagation()}>
					<Popconfirm
						title={`Удаление ${type === "folder" ? "папки" : "проекта"}`}
						description={
							<DeleteConfirmDescription
								type={type}
								name={name}
								projectsCount={projectsCount}
								deleteProjects={deleteProjects}
								onDeleteProjectsChange={setDeleteProjects}
							/>
						}
						onConfirm={handleDelete}
						onOpenChange={handleOpenChange}
						okText="Удалить"
						okButtonProps={{ danger: true }}
						cancelText="Отмена"
					>
						<Button
							type="text"
							icon={<DeleteOutlined />}
							className={styles.deleteButton}
						/>
					</Popconfirm>
				</span>
			)}
			{children}
		</Card>
	);
};
