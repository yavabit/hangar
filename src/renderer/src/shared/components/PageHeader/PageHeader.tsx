import { FC, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import "./PageHeader.scss";

export type PageBreadcrumb = {
	title: ReactNode;
	icon?: ReactNode;
	to?: string;
};

type PageHeaderProps = {
	title: ReactNode;
	description?: ReactNode;
	breadcrumbs?: PageBreadcrumb[];
	extra?: ReactNode;
};

export const PageHeader: FC<PageHeaderProps> = ({ title, description, breadcrumbs, extra }) => {
	return (
		<header className="page-header">
			{breadcrumbs && breadcrumbs.length > 0 && (
				<nav className="page-header__breadcrumbs" aria-label="Навигация">
					{breadcrumbs.map((crumb, index) => {
						const content = (
							<>
								{crumb.icon}
								<span>{crumb.title}</span>
							</>
						);

						return (
							<span key={crumb.to ?? "current"} className="page-header__crumb">
								{index > 0 && <ChevronRight size={13} className="page-header__separator" />}
								{crumb.to ? <Link to={crumb.to}>{content}</Link> : <span className="page-header__current">{content}</span>}
							</span>
						);
					})}
				</nav>
			)}
			<div className="page-header__row">
				<div className="page-header__titles">
					<h1 className="page-title">{title}</h1>
					{description && <div className="page-header__description">{description}</div>}
				</div>
				{extra && <div className="page-header__extra">{extra}</div>}
			</div>
		</header>
	);
};
