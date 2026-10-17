import { FC, ReactNode } from "react";
import { DeleteAction, type DeleteConfirm } from "../DeleteAction/DeleteAction";

import "../CardAction/CardAction.scss";
import "./CardShell.scss";

type CardShellProps = {
	children: ReactNode;
	/** Действия: появляются плавающей панелью при наведении */
	actions?: ReactNode;
	deleteConfirm?: DeleteConfirm;
	onClick?: () => void;
	onDoubleClick?: () => void;
	className?: string;
};

const stop = (e: React.SyntheticEvent): void => e.stopPropagation();

/**
 * Стеклянная карточка с панелью действий при наведении.
 * Клики в панели и во всплывающем подтверждении удаления не открывают саму карточку.
 */
export const CardShell: FC<CardShellProps> = ({ children, actions, deleteConfirm, onClick, onDoubleClick, className = "" }) => (
	<article
		className={`card-shell glass ${onClick ? "card-shell--clickable" : ""} ${className}`}
		onClick={onClick}
		onDoubleClick={onDoubleClick}
		onKeyDown={(e) => {
			if (onClick && e.key === "Enter" && e.target === e.currentTarget) {
				onClick();
			}
		}}
		tabIndex={onClick ? 0 : undefined}
	>
		{(actions || deleteConfirm) && (
			<div className="card-shell__actions" onClick={stop} onDoubleClick={stop}>
				{actions}
				{deleteConfirm && <DeleteAction {...deleteConfirm} />}
			</div>
		)}
		{children}
	</article>
);
