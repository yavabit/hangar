import { FC } from "react";
import { Tooltip } from "antd";
import { STACKS, type StackId } from "@common/utils/stacks";

import "./StackAvatar.scss";

type StackAvatarProps = {
	stack: StackId | null | undefined;
	/** Название проекта: из него монограмма, если стек не определён */
	name: string;
	size?: "sm" | "md" | "lg";
};

const getInitials = (name: string): string => {
	const words = name.split(/[\s\-_.]+/).filter(Boolean);
	const initials = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
	return initials.toUpperCase();
};

/** Значок проекта: монограмма стека его цветом или инициалы проекта */
export const StackAvatar: FC<StackAvatarProps> = ({ stack, name, size = "md" }) => {
	const meta = stack ? STACKS[stack] : null;

	return (
		<Tooltip title={meta?.label} mouseEnterDelay={0.4}>
			<span
				className={`stack-avatar stack-avatar--${size} ${meta ? "" : "stack-avatar--unknown"}`}
				style={meta ? ({ "--stack": meta.color } as React.CSSProperties) : undefined}
				aria-hidden="true"
			>
				{meta?.short ?? getInitials(name)}
			</span>
		</Tooltip>
	);
};
