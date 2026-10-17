import { FC, ReactNode } from "react";
import { Tooltip } from "antd";

import styles from "./CardAction.module.scss";

type CardActionProps = {
	title: ReactNode;
	icon: ReactNode;
	color?: string;
	disabled?: boolean;
	/** Только индикатор: цвет сохраняется, но нажать нельзя */
	inactive?: boolean;
	onClick?: () => void;
};

/**
 * Кнопка-иконка в нижней панели карточки.
 */
export const CardAction: FC<CardActionProps> = ({ title, icon, color, disabled = false, inactive = false, onClick }) => {
	const clickable = !disabled && !inactive;

	const handleClick = (e: React.MouseEvent): void => {
		e.stopPropagation();
		if (clickable) {
			onClick?.();
		}
	};

	return (
		<Tooltip title={title}>
			<span
				role={clickable ? "button" : undefined}
				aria-disabled={!clickable}
				aria-label={typeof title === "string" ? title : undefined}
				className={`${styles.action} ${disabled ? styles.disabled : ""} ${inactive ? styles.inactive : ""}`}
				style={disabled ? undefined : { color }}
				onClick={handleClick}
				onDoubleClick={(e) => e.stopPropagation()}
			>
				{icon}
			</span>
		</Tooltip>
	);
};

/** Неинтерактивная подпись в панели действий (например, количество проектов) */
export const CardActionLabel: FC<{ children: ReactNode }> = ({ children }) => (
	<span className={styles.label} onClick={(e) => e.stopPropagation()}>
		{children}
	</span>
);
