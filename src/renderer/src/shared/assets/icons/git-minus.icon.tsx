import { FC, SVGProps } from "react";

export const GitMinusIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M15 6a9 9 0 0 0-9 9V3" />
		<path d="M21 18h-6" />
		<circle cx="18" cy="6" r="3" />
		<circle cx="6" cy="18" r="3" />
	</svg>
);
