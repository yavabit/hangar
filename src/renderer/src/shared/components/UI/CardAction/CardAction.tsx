import { FC, ReactNode } from "react";
import { Tooltip } from "antd";

import "./CardAction.scss";

type CardActionProps = {
	title: ReactNode;
	icon: ReactNode;
	/** Подпись рядом со значком — для главного действия */
	label?: string;
	variant?: "default" | "primary" | "danger";
	disabled?: boolean;
	onClick?: () => void;
};

/** Кнопка в строке действий карточки */
export const CardAction: FC<CardActionProps> = ({ title, icon, label, variant = "default", disabled = false, onClick }) => {
	const handleClick = (e: React.MouseEvent): void => {
		e.stopPropagation();
		if (!disabled) {
			onClick?.();
		}
	};

	return (
		<Tooltip title={title}>
			<button
				type="button"
				aria-label={typeof title === "string" ? title : label}
				aria-disabled={disabled}
				className={`card-action card-action--${variant} ${label ? "card-action--labeled" : ""} ${disabled ? "card-action--disabled" : ""}`}
				onClick={handleClick}
				onDoubleClick={(e) => e.stopPropagation()}
			>
				{icon}
				{label && <span>{label}</span>}
			</button>
		</Tooltip>
	);
};
