import { FC, ReactNode } from "react";

import "./Section.scss";

type SectionProps = {
	title: ReactNode;
	count?: number;
	children: ReactNode;
};

export const Section: FC<SectionProps> = ({ title, count, children }) => (
	<section className="page-section">
		<div className="page-section__title">
			{title}
			{count !== undefined && <span className="page-section__count">{count}</span>}
		</div>
		{children}
	</section>
);
