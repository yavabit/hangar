/** Цвета папок на выбор. Без цвета папка берёт цвет родителя, а на верхнем уровне — акцентный */
export const FOLDER_COLORS: { value: string; label: string }[] = [
	{ value: "#6366f1", label: "Индиго" },
	{ value: "#3b82f6", label: "Синий" },
	{ value: "#06b6d4", label: "Бирюзовый" },
	{ value: "#10b981", label: "Зелёный" },
	{ value: "#84cc16", label: "Салатовый" },
	{ value: "#f59e0b", label: "Янтарный" },
	{ value: "#f97316", label: "Оранжевый" },
	{ value: "#ef4444", label: "Красный" },
	{ value: "#ec4899", label: "Розовый" },
	{ value: "#a855f7", label: "Фиолетовый" },
	{ value: "#64748b", label: "Серый" },
];

/** CSS-переменная с цветом папки: стили берут из неё фон и цвет значка */
export const folderColorStyle = (color: string | undefined): React.CSSProperties | undefined =>
	color ? ({ "--folder-color": color } as React.CSSProperties) : undefined;
