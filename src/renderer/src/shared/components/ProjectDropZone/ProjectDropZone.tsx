import { FC, ReactNode, useState } from "react";
import { useUiStore } from "@renderer/store/ui.store";
import { FOLDER_DRAG_TYPE, getDraggedProjectId, isFolderDrag, isProjectDrag } from "@renderer/shared/utils/dragAndDrop";
import type { Folder, Project } from "@schemas/store.schema";

import "./ProjectDropZone.scss";

type ProjectDropZoneProps = {
	onDropProject?: (projectId: Project["id"]) => void;
	/** Проекты, которые сюда класть бессмысленно (например, уже лежат в этой папке) */
	accepts?: (projectId: Project["id"]) => boolean;
	/** Сброс папки: перенос внутрь этой папки */
	onDropFolder?: (folderId: Folder["id"]) => void;
	/** Папки, которые сюда переносить нельзя: саму себя, родителя или слишком глубоко */
	acceptsFolder?: (folderId: Folder["id"]) => boolean;
	children: ReactNode;
	className?: string;
};

/** Область, куда можно перетащить карточку проекта или папку */
export const ProjectDropZone: FC<ProjectDropZoneProps> = ({
	onDropProject,
	accepts,
	onDropFolder,
	acceptsFolder,
	children,
	className = "",
}) => {
	const draggingProjectId = useUiStore((s) => s.draggingProjectId);
	const draggingFolderId = useUiStore((s) => s.draggingFolderId);
	const [isOver, setIsOver] = useState(false);

	const canAcceptProject = !!onDropProject && !!draggingProjectId && (accepts?.(draggingProjectId) ?? true);
	const canAcceptFolder = !!onDropFolder && !!draggingFolderId && (acceptsFolder?.(draggingFolderId) ?? true);
	const canAccept = canAcceptProject || canAcceptFolder;

	const handleDragOver = (e: React.DragEvent): void => {
		const fits = (isProjectDrag(e) && canAcceptProject) || (isFolderDrag(e) && canAcceptFolder);
		if (!fits) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = "move";
		setIsOver(true);
	};

	const handleDrop = (e: React.DragEvent): void => {
		setIsOver(false);

		const projectId = getDraggedProjectId(e);
		if (projectId && canAcceptProject) {
			e.preventDefault();
			e.stopPropagation();
			onDropProject?.(projectId);
			return;
		}

		const folderId = e.dataTransfer.getData(FOLDER_DRAG_TYPE);
		if (folderId && canAcceptFolder) {
			e.preventDefault();
			e.stopPropagation();
			onDropFolder?.(folderId);
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
