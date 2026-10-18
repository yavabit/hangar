import { FC } from "react";
import { Tooltip } from "antd";
import { STACKS, formatStacks, type StackId } from "@common/utils/stacks";
import { STACK_ICON_PATHS } from "@renderer/shared/assets/icons/stacks";

import "./StackAvatar.scss";

type StackAvatarProps = {
	/** Стеки проекта, главный первым. undefined — ещё не проверены */
	stacks: readonly StackId[] | undefined;
	/** Название проекта: из него инициалы, если стек не определён */
	name: string;
	size?: "sm" | "md" | "lg";
};

const getInitials = (name: string): string => {
	const words = name.split(/[\s\-_.]+/).filter(Boolean);
	const initials = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
	return initials.toUpperCase();
};

const StackIcon: FC<{ stack: StackId; className: string }> = ({ stack, className }) => (
	<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d={STACK_ICON_PATHS[stack]} />
	</svg>
);

const stackColor = (stack: StackId): React.CSSProperties => ({ "--stack": STACKS[stack].color }) as React.CSSProperties;

/**
 * Значок проекта: логотип главного стека его цветом, второй стек — бейджем в углу.
 * Если стек не определён — инициалы проекта.
 */
export const StackAvatar: FC<StackAvatarProps> = ({ stacks, name, size = "md" }) => {
	const [primary, secondary] = stacks ?? [];

	return (
		<Tooltip title={stacks?.length ? formatStacks(stacks) : undefined} mouseEnterDelay={0.4}>
			<span
				className={`stack-avatar stack-avatar--${size} ${primary ? "" : "stack-avatar--unknown"}`}
				style={primary ? stackColor(primary) : undefined}
				aria-label={stacks?.length ? formatStacks(stacks) : undefined}
			>
				{primary ? <StackIcon stack={primary} className="stack-avatar__icon" /> : getInitials(name)}
				{secondary && (
					<span className="stack-avatar__badge" style={stackColor(secondary)}>
						<StackIcon stack={secondary} className="stack-avatar__badge-icon" />
					</span>
				)}
			</span>
		</Tooltip>
	);
};
