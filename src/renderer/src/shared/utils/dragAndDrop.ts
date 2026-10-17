/** Тип данных при перетаскивании проекта: так зоны сброса отличают его от файлов и текста */
export const PROJECT_DRAG_TYPE = "application/x-hangar-project";

export const isProjectDrag = (e: React.DragEvent): boolean => e.dataTransfer.types.includes(PROJECT_DRAG_TYPE);

export const getDraggedProjectId = (e: React.DragEvent): string | null =>
	e.dataTransfer.getData(PROJECT_DRAG_TYPE) || null;
