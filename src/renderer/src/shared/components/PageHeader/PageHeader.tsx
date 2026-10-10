import { FC, ReactNode } from "react";
import { Breadcrumb } from "antd";
import { Link } from "react-router-dom";

import "./PageHeader.scss";

export type PageBreadcrumb = {
	title: ReactNode;
	icon?: ReactNode;
	to?: string;
};

type PageHeaderProps = {
	title: ReactNode;
	icon?: ReactNode;
	description?: ReactNode;
	breadcrumbs?: PageBreadcrumb[];
	extra?: ReactNode;
};

export const PageHeader: FC<PageHeaderProps> = ({ title, icon, description, breadcrumbs, extra }) => {
	return (
		<header className="page-header">
			{breadcrumbs && breadcrumbs.length > 0 && (
				<Breadcrumb
					className="page-header__breadcrumbs"
					items={breadcrumbs.map((crumb) => {
						const content = (
							<>
								{crumb.icon}
								<span>{crumb.title}</span>
							</>
						);

						return {
							title: crumb.to ? <Link to={crumb.to}>{content}</Link> : content,
						};
					})}
				/>
			)}
			<div className="page-header__row">
				{icon && <span className="page-header__icon">{icon}</span>}
				<div className="page-header__titles">
					<h1 className="page-title">{title}</h1>
					{description && <div className="page-header__description">{description}</div>}
				</div>
				{extra && <div className="page-header__extra">{extra}</div>}
			</div>
		</header>
	);
};
