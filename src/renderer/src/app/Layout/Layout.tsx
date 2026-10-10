import { FC, ReactNode, useState } from "react";
import { FolderOutlined, SettingOutlined, CodeOutlined, StarOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";

import "./Layout.scss";

const { Content, Sider } = Layout;

const menuItems = [
	{ key: "/fav", label: <Link to="/fav">Избранное</Link>, icon: <StarOutlined /> },
	{ key: "/", label: <Link to="/">Проекты</Link>, icon: <FolderOutlined /> },
	{ key: "/scripts", label: <Link to="/scripts">Скрипты</Link>, icon: <CodeOutlined /> },
	{
		key: "/settings",
		label: <Link to="/settings">Настройки</Link>,
		icon: <SettingOutlined />,
	},
];

export const FullLayout: FC<{ children: ReactNode }> = ({ children }) => {
	const [collapsed, setCollapsed] = useState(false);

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
				<div className="logo">
					<div className="demo-logo-vertical" />
					{!collapsed && <div className="title-logo">Project Launcher</div>}
				</div>
				<Menu
					theme="light"
					defaultSelectedKeys={["/"]}
					mode="inline"
					items={menuItems}
				/>
			</Sider>
			<Layout>
				<Content style={{ width: "100%" }}>
					<div className="main-layout">{children}</div>
				</Content>
			</Layout>
		</Layout>
	);
};
