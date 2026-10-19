import { cloneElement, FC, ReactElement, useState } from "react";
import { Tooltip, type TooltipProps } from "antd";

type ChildProps = {
	onMouseEnter?: (event: React.MouseEvent) => void;
	onFocus?: (event: React.FocusEvent) => void;
};

type LazyTooltipProps = Omit<TooltipProps, "children"> & {
	children: ReactElement<ChildProps>;
};

/**
 * Тултип antd, который создаётся только при первом наведении или фокусе.
 * На карточке их около десятка, и на сотне карточек полноценные тултипы
 * заметно замедляют первую отрисовку списка.
 */
export const LazyTooltip: FC<LazyTooltipProps> = ({ children, ...props }) => {
	const [armed, setArmed] = useState(false);

	if (!props.title) {
		return children;
	}

	if (armed) {
		return (
			<Tooltip defaultOpen {...props}>
				{children}
			</Tooltip>
		);
	}

	return cloneElement(children, {
		onMouseEnter: (event: React.MouseEvent) => {
			children.props.onMouseEnter?.(event);
			setArmed(true);
		},
		onFocus: (event: React.FocusEvent) => {
			children.props.onFocus?.(event);
			setArmed(true);
		},
	});
};
