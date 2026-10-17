import { FC, useState } from "react";
import { AppstoreOutlined, SettingOutlined, CodeOutlined, SearchOutlined, StarOutlined } from "@ant-design/icons";
import { Badge, Layout, Menu, Tooltip } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "@renderer/store/app.store";
import { CommandPalette } from "@renderer/shared/components/CommandPalette/CommandPalette";
import logo from "@renderer/shared/assets/logo/logo.svg";

import "./Layout.scss";

const { Content, Sider } = Layout;

const getSelectedKey = (pathname: string): string => {
	if (pathname.startsWith("/folder/")) {
		return "/";
	}

	return pathname;
};

export const FullLayout: FC = () => {
	const [collapsed, setCollapsed] = useState(false);
	const { pathname } = useLocation();

	const favoritesCount = useAppStore((s) => s.projects.filter((p) => p.isFavorite).length);

	const menuItems = [
		{ key: "/", label: <Link to="/">Проекты</Link>, icon: <AppstoreOutlined /> },
		{
			key: "/fav",
			label: (
				<Link to="/fav" className="menu-link-with-count">
					Избранное
					{favoritesCount > 0 && <Badge count={favoritesCount} color="#faad14" size="small" />}
				</Link>
			),
			icon: <StarOutlined />,
		},
		{ key: "/scripts", label: <Link to="/scripts">Скрипты</Link>, icon: <CodeOutlined /> },
		{
			key: "/settings",
			label: <Link to="/settings">Настройки</Link>,
			icon: <SettingOutlined />,
		},
	];

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={(value) => setCollapsed(value)}
				theme="light"
				style={{
					overflow: 'auto',
					height: '100vh',
					position: 'sticky',
					insetInlineStart: 0,
					top: 0,
				}}
			>
				<Link to="/" className={`sidebar-logo ${collapsed ? "sidebar-logo--collapsed" : ""}`}>
					<img className="sidebar-logo__image" src={logo} alt="" />
					{!collapsed && (
						<div className="sidebar-logo__title">
							Project
							<br />
							Launcher
						</div>
					)}
				</Link>
				<Tooltip title={collapsed ? "Найти проект (Ctrl+K)" : undefined} placement="right">
					<button
						type="button"
						className={`sidebar-search ${collapsed ? "sidebar-search--collapsed" : ""}`}
						onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyK", ctrlKey: true }))}
					>
						<SearchOutlined />
						{!collapsed && (
							<>
								<span className="sidebar-search__text">Найти проект</span>
								<kbd>Ctrl K</kbd>
							</>
						)}
					</button>
				</Tooltip>
				<Menu
					theme="light"
					selectedKeys={[getSelectedKey(pathname)]}
					mode="inline"
					items={menuItems}
				/>
			</Sider>
			<Layout>
				<Content style={{ width: "100%" }}>
					<div className="main-layout">
						<Outlet />
					</div>
					<CommandPalette />
				</Content>
			</Layout>
		</Layout>
	);
};
