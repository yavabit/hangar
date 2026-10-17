const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

/**
 * Ссылка на задачу: адрес трекера из настроек + путь из проекта.
 * Полная ссылка в проекте используется как есть.
 */
export const buildTaskUrl = (trackerUrl: string, taskPath: string | undefined): string | null => {
	const path = taskPath?.trim();
	if (!path) {
		return null;
	}

	if (isAbsoluteUrl(path)) {
		return path;
	}

	const base = trackerUrl.trim();
	if (!isAbsoluteUrl(base)) {
		return null;
	}

	return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};
