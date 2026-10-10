import { FC, ReactNode } from "react";
import { Tooltip } from "antd";

import styles from "./CardAction.module.scss";

type CardActionProps = {
	title: ReactNode;
	icon: ReactNode;
	color?: string;
	disabled?: boolean;
	onClick?: () => void;
};

/**
 * Кнопка-иконка в нижней панели карточки.
 */
export const CardAction: FC<CardActionProps> = ({ title, icon, color, disabled = false, onClick }) => {
	const handleClick = (e: React.MouseEvent): void => {
		e.stopPropagation();
		if (!disabled) {
			onClick?.();
		}
	};

	return (
		<Tooltip title={title}>
			<span
				role="button"
				aria-disabled={disabled}
				aria-label={typeof title === "string" ? title : undefined}
				className={`${styles.action} ${disabled ? styles.disabled : ""}`}
				style={disabled ? undefined : { color }}
				onClick={handleClick}
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
