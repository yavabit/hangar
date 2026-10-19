import "./dragPreview.scss";

/** Прозрачная картинка вместо системной: свою копию карточки рисуем сами */
const EMPTY_IMAGE = new Image();
EMPTY_IMAGE.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Показывает при перетаскивании копию элемента целиком, которая едет за курсором.
 * Системная картинка в Windows полупрозрачная и гасит края больших элементов,
 * поэтому от карточки видна только часть.
 */
export const startDragPreview = (e: React.DragEvent, source: Element | null): void => {
	if (!source) {
		return;
	}

	const rect = source.getBoundingClientRect();
	const offsetX = e.clientX - rect.left;
	const offsetY = e.clientY - rect.top;

	const preview = document.createElement("div");
	preview.className = "drag-preview";
	preview.style.width = `${rect.width}px`;
	preview.style.height = `${rect.height}px`;
	preview.appendChild(source.cloneNode(true));
	document.body.appendChild(preview);

	const move = (x: number, y: number): void => {
		preview.style.transform = `translate(${x - offsetX}px, ${y - offsetY}px)`;
	};
	move(e.clientX, e.clientY);

	e.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0);

	const handleDragOver = (event: DragEvent): void => move(event.clientX, event.clientY);

	const cleanup = (): void => {
		preview.remove();
		document.removeEventListener("dragover", handleDragOver, true);
		document.removeEventListener("drop", cleanup, true);
		document.removeEventListener("dragend", cleanup, true);
	};

	document.addEventListener("dragover", handleDragOver, true);
	document.addEventListener("drop", cleanup, true);
	document.addEventListener("dragend", cleanup, true);
};
