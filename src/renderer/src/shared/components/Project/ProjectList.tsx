import { FC, ReactNode, useMemo, useState } from "react";
import { Col, Empty, Row } from "antd";
import { Project } from "./Project";
import { Project as ProjectType } from "@schemas/store.schema";
import empty from "@shared/assets/icons/empty-folder.png";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { useAppStore } from "@renderer/store/app.store";
import { useUiStore } from "@renderer/store/ui.store";
import { PROJECT_DRAG_TYPE } from "@renderer/shared/utils/dragAndDrop";
import { ProjectModal } from "../Modals/ProjectModal";

type ProjectListProps = {
	items: ProjectType[];
	showEmpty?: boolean;
	showFolder?: boolean;
	emptyDescription?: ReactNode;
	emptyExtra?: ReactNode;
}

export const ProjectList: FC<ProjectListProps> = ({
	items = [],
	showEmpty = true,
	showFolder = false,
	emptyDescription = "Проектов не найдено",
	emptyExtra,
}) => {

	const { removeProject, toggleFavorite, openProjectFolder, openProjectInIde } = useProjects();
	const folders = useAppStore((s) => s.folders);
	const health = useAppStore((s) => s.health);
	const draggingProjectId = useUiStore((s) => s.draggingProjectId);
	const setDraggingProjectId = useUiStore((s) => s.setDraggingProjectId);

	const [editing, setEditing] = useState<{ id: ProjectType["id"] | null; open: boolean }>({ id: null, open: false });
	const editingProject = items.find((p) => p.id === editing.id);

	const foldersById = useMemo(
		() => new Map(folders.map((folder) => [folder.id, folder])),
		[folders],
	);

	if (items.length === 0) {
		return showEmpty ? (
			<Empty
				image={empty}
				description={emptyDescription}
				styles={{ image: { height: 160 }, description: { fontSize: 20 } }}
				style={{ padding: "24px 0" }}
			>
				{emptyExtra}
			</Empty>
		) : null;
	}

	return (
		<div>
			<Row gutter={[16, 16]}> {/* 16px отступы между колонками по горизонтали и вертикали */}
				{items.map((project) => (
					<Col
						key={project.id}
						xs={24} // 1 элемент в строку
						sm={12} //2 элемента в строку
						md={8} // 3 элемента в строку
						lg={6} // 4 элемента в строку
						xl={4} // 5-6 элементов в строку
						style={{ minWidth: 350 }}
					>
						<div
							className={`project-drag-wrapper ${draggingProjectId === project.id ? "project-drag-wrapper--dragging" : ""}`}
							draggable
							onDragStart={(e) => {
								e.dataTransfer.setData(PROJECT_DRAG_TYPE, project.id);
								e.dataTransfer.effectAllowed = "move";
								setDraggingProjectId(project.id);
							}}
							onDragEnd={() => setDraggingProjectId(null)}
						>
							<Project
								item={project}
								health={health[project.id]}
								folder={showFolder && project.folderId ? foldersById.get(project.folderId) : undefined}
								onDelete={removeProject}
								onFavorite={toggleFavorite}
								handleOpenFolder={openProjectFolder}
								handleOpenIde={openProjectInIde}
								handleEdit={(id) => setEditing({ id, open: true })}
							/>
						</div>
					</Col>
				))}
			</Row>
			<ProjectModal
				isOpen={editing.open && !!editingProject}
				project={editingProject}
				onClose={() => setEditing((prev) => ({ ...prev, open: false }))}
			/>
		</div>
	);
};
