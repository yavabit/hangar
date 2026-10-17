import { FC, ReactNode, useState } from "react";
import { useUiStore } from "@renderer/store/ui.store";
import { getDraggedProjectId, isProjectDrag } from "@renderer/shared/utils/dragAndDrop";
import type { Project } from "@schemas/store.schema";

import "./ProjectDropZone.scss";

type ProjectDropZoneProps = {
	onDropProject: (projectId: Project["id"]) => void;
	/** Проекты, которые сюда класть бессмысленно (например, уже лежат в этой папке) */
	accepts?: (projectId: Project["id"]) => boolean;
	children: ReactNode;
	className?: string;
};

/** Область, куда можно перетащить карточку проекта */
export const ProjectDropZone: FC<ProjectDropZoneProps> = ({ onDropProject, accepts, children, className = "" }) => {
	const draggingProjectId = useUiStore((s) => s.draggingProjectId);
	const [isOver, setIsOver] = useState(false);

	const canAccept = !!draggingProjectId && (accepts?.(draggingProjectId) ?? true);

	const handleDragOver = (e: React.DragEvent): void => {
		if (!isProjectDrag(e) || !canAccept) {
			return;
		}
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setIsOver(true);
	};

	const handleDrop = (e: React.DragEvent): void => {
		setIsOver(false);
		const projectId = getDraggedProjectId(e);
		if (projectId && canAccept) {
			e.preventDefault();
			onDropProject(projectId);
		}
	};

	return (
		<div
			className={`project-drop-zone ${canAccept ? "project-drop-zone--active" : ""} ${isOver ? "project-drop-zone--over" : ""} ${className}`}
			onDragOver={handleDragOver}
			onDragLeave={() => setIsOver(false)}
			onDrop={handleDrop}
		>
			{children}
		</div>
	);
};
