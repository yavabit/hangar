import { FC, ReactNode } from "react";

import "./EmptyState.scss";

type EmptyStateProps = {
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	compact?: boolean;
};

/** Пустой ангар: пунктирная арка в стиле логотипа */
const HangarIllustration: FC<{ size: number }> = ({ size }) => (
	<svg width={size} height={size * 0.8} viewBox="0 0 120 96" aria-hidden="true" className="empty-state__art">
		<path d="M14 86 H106" stroke="var(--divider)" strokeWidth="3" strokeLinecap="round" />
		<path
			d="M28 86 V50 A32 32 0 0 1 92 50 V86"
			fill="none"
			stroke="var(--accent)"
			strokeWidth="5"
			strokeLinecap="round"
			strokeDasharray="2 9"
		/>
		<path d="M50 62 L60 52 L70 62 M60 52 V80" fill="none" stroke="var(--text-faint)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const EmptyState: FC<EmptyStateProps> = ({ title, description, actions, compact = false }) => (
	<div className={`empty-state ${compact ? "empty-state--compact" : ""}`}>
		<HangarIllustration size={compact ? 84 : 120} />
		<div className="empty-state__title">{title}</div>
		{description && <div className="empty-state__description">{description}</div>}
		{actions && <div className="empty-state__actions">{actions}</div>}
	</div>
);
