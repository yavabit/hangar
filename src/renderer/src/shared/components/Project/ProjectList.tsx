import { FC, ReactNode, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Project } from "./Project";
import { ProjectRow } from "./ProjectRow";
import { Project as ProjectType } from "@schemas/store.schema";
import { useAppStore } from "@renderer/store/app.store";
import { useUiStore } from "@renderer/store/ui.store";
import { PROJECT_DRAG_TYPE } from "@renderer/shared/utils/dragAndDrop";
import { EmptyState } from "../EmptyState/EmptyState";
import { ProjectModal } from "../Modals/ProjectModal";

type ProjectListProps = {
	items: ProjectType[];
	showEmpty?: boolean;
	showFolder?: boolean;
	emptyDescription?: ReactNode;
	emptyExtra?: ReactNode;
}

const itemMotion = {
	layout: true,
	initial: { opacity: 0, scale: 0.97 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.97 },
	transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] as const },
};

export const ProjectList: FC<ProjectListProps> = ({
	items = [],
	showEmpty = true,
	showFolder = false,
	emptyDescription = "Проектов не найдено",
	emptyExtra,
}) => {
	const folders = useAppStore((s) => s.folders);
	const health = useAppStore((s) => s.health);
	const layout = useUiStore((s) => s.layout);
	const draggingProjectId = useUiStore((s) => s.draggingProjectId);
	const setDraggingProjectId = useUiStore((s) => s.setDraggingProjectId);

	const [editing, setEditing] = useState<{ id: ProjectType["id"] | null; open: boolean }>({ id: null, open: false });
	const editingProject = items.find((p) => p.id === editing.id);

	const foldersById = useMemo(
		() => new Map(folders.map((folder) => [folder.id, folder])),
		[folders],
	);

	if (items.length === 0) {
		return showEmpty ? <EmptyState title={emptyDescription} actions={emptyExtra} /> : null;
	}

	const View = layout === "list" ? ProjectRow : Project;

	return (
		<div>
			<div className={layout === "list" ? "project-list-rows glass" : "project-list-grid"}>
				<AnimatePresence initial={false} mode="popLayout">
					{items.map((project) => (
						<motion.div key={project.id} {...itemMotion}>
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
								<View
									item={project}
									health={health[project.id]}
									folder={showFolder && project.folderId ? foldersById.get(project.folderId) : undefined}
									onEdit={(id) => setEditing({ id, open: true })}
								/>
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
			<ProjectModal
				isOpen={editing.open && !!editingProject}
				project={editingProject}
				onClose={() => setEditing((prev) => ({ ...prev, open: false }))}
			/>
		</div>
	);
};
