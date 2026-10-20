import { FC, ReactElement, Ref, useCallback, useEffect, useRef, useState } from "react";
import { Tooltip as AntTooltip, type TooltipProps as AntTooltipProps } from "antd";

type ChildProps = {
	ref?: Ref<HTMLElement>;
	onMouseEnter?: (event: React.MouseEvent) => void;
	onMouseLeave?: (event: React.MouseEvent) => void;
	onFocus?: (event: React.FocusEvent) => void;
	onBlur?: (event: React.FocusEvent) => void;
};

export type TooltipProps = Omit<AntTooltipProps, "children" | "open" | "defaultOpen" | "onOpenChange"> & {
	children: ReactElement<ChildProps>;
};

const DEFAULT_DELAY_MS = 120;

/**
 * Тултип, который сам решает, когда показываться. Стандартный тултип antd ждёт события «мышь ушла»,
 * а оно теряется, если окно в этот момент потеряло фокус (например, открылась IDE), — и тултип висит.
 * Этот закрывается, когда мышь оказалась над любым другим элементом, при клике, прокрутке, уходе мыши
 * из окна и потере фокуса. Сам тултип antd создаётся только при первом наведении: на сотне
 * карточек их иначе были бы сотни.
 */
export const Tooltip: FC<TooltipProps> = ({ children, mouseEnterDelay, ...props }) => {
	const [armed, setArmed] = useState(false);
	const [open, setOpen] = useState(false);
	const nodeRef = useRef<HTMLElement | null>(null);
	const timerRef = useRef<number | undefined>(undefined);
	const { onMouseEnter, onMouseLeave, onFocus, onBlur } = children.props;
	const delayMs = mouseEnterDelay !== undefined ? mouseEnterDelay * 1000 : DEFAULT_DELAY_MS;

	const setNode = useCallback((node: HTMLElement | null) => {
		nodeRef.current = node;
	}, []);

	const hide = useCallback(() => {
		window.clearTimeout(timerRef.current);
		setOpen(false);
	}, []);

	const show = useCallback(() => {
		setArmed(true);
		window.clearTimeout(timerRef.current);
		timerRef.current = window.setTimeout(() => setOpen(true), delayMs);
	}, [delayMs]);

	const handleMouseEnter = useCallback(
		(event: React.MouseEvent) => {
			onMouseEnter?.(event);
			show();
		},
		[onMouseEnter, show],
	);

	const handleMouseLeave = useCallback(
		(event: React.MouseEvent) => {
			onMouseLeave?.(event);
			hide();
		},
		[onMouseLeave, hide],
	);

	const handleFocus = useCallback(
		(event: React.FocusEvent) => {
			onFocus?.(event);
			show();
		},
		[onFocus, show],
	);

	const handleBlur = useCallback(
		(event: React.FocusEvent) => {
			onBlur?.(event);
			hide();
		},
		[onBlur, hide],
	);

	useEffect(() => hide, [hide]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const handleMouseOver = (event: MouseEvent): void => {
			if (!nodeRef.current?.contains(event.target as Node)) {
				hide();
			}
		};
		const root = document.documentElement;

		document.addEventListener("mouseover", handleMouseOver, true);
		document.addEventListener("wheel", hide, { capture: true, passive: true });
		document.addEventListener("mousedown", hide, true);
		root.addEventListener("mouseleave", hide);
		window.addEventListener("blur", hide);

		return () => {
			document.removeEventListener("mouseover", handleMouseOver, true);
			document.removeEventListener("wheel", hide, true);
			document.removeEventListener("mousedown", hide, true);
			root.removeEventListener("mouseleave", hide);
			window.removeEventListener("blur", hide);
		};
	}, [open, hide]);

	if (!props.title) {
		return children;
	}

	const ChildType = children.type as React.ElementType;
	const child = (
		<ChildType
			{...children.props}
			ref={setNode}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onFocus={handleFocus}
			onBlur={handleBlur}
		/>
	);

	return armed ? (
		<AntTooltip {...props} open={open}>
			{child}
		</AntTooltip>
	) : (
		child
	);
};
