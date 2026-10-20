import { FC, useEffect, useState } from "react";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import { FolderPlus, LayoutGrid, PanelLeftClose, PanelLeftOpen, Settings, SquareTerminal, Star } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "@renderer/store/app.store";
import { useUiStore } from "@renderer/store/ui.store";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import { ThemeSwitcher } from "@renderer/shared/components/ThemeSwitcher/ThemeSwitcher";
import { AddOrEditFolderModal } from "@renderer/pages/Projects/components/Modals/AddFolderModal";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";
import { SidebarFolders } from "./SidebarFolders";

const NOW_TICK_MS = 30_000;

type NavItemProps = {
	to: string;
	icon: React.ReactNode;
	label: string;
	count?: number;
	active?: boolean;
	collapsed: boolean;
};

const NavItem: FC<NavItemProps> = ({ to, icon, label, count, active, collapsed }) => (
	<Tooltip title={collapsed ? label : undefined} placement="right">
		<NavLink
			to={to}
			className={({ isActive }) => `sidebar__item ${active ?? isActive ? "sidebar__item--active" : ""}`}
			end
		>
			<span className="sidebar__item-icon">{icon}</span>
			{!collapsed && (
				<>
					<span className="sidebar__item-label">{label}</span>
					{count !== undefined && count > 0 && <span className="sidebar__count">{count}</span>}
				</>
			)}
		</NavLink>
	</Tooltip>
);

/** Время последней полной проверки статусов, обновляется раз в полминуты */
const StatusLine: FC = () => {
	const checkedAt = useAppStore((s) => s.checkedAt);
	const [, setTick] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => setTick((tick) => tick + 1), NOW_TICK_MS);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="sidebar__status">
			<span className={`sidebar__status-dot ${checkedAt ? "" : "sidebar__status-dot--pending"}`} />
			{checkedAt ? `Статусы обновлены ${formatRelativeTime(checkedAt)}` : "Проверяем проекты…"}
		</div>
	);
};

export const Sidebar: FC = () => {
	const { pathname } = useLocation();
	const projects = useAppStore((s) => s.projects);
	const collapsed = useUiStore((s) => s.sidebarCollapsed);
	const toggleSidebar = useUiStore((s) => s.toggleSidebar);
	const { addFolder } = useFolders();
	const [folderModalOpen, setFolderModalOpen] = useState(false);

	const favoritesCount = projects.filter((p) => p.isFavorite).length;

	return (
		<aside className={`sidebar glass ${collapsed ? "sidebar--collapsed" : ""}`}>
			<nav className="sidebar__nav" aria-label="Разделы">
				<NavItem to="/" icon={<LayoutGrid size={16} strokeWidth={1.9} />} label="Проекты" count={projects.length} active={pathname === "/"} collapsed={collapsed} />
				<NavItem to="/fav" icon={<Star size={16} strokeWidth={1.9} />} label="Избранное" count={favoritesCount} collapsed={collapsed} />
				<NavItem to="/scripts" icon={<SquareTerminal size={16} strokeWidth={1.9} />} label="Скрипты" collapsed={collapsed} />
				<NavItem to="/settings" icon={<Settings size={16} strokeWidth={1.9} />} label="Настройки" collapsed={collapsed} />
			</nav>

			<div className="sidebar__section">
				<SidebarFolders
					collapsed={collapsed}
					createButton={
						<Tooltip title="Новая папка">
							<button type="button" className="sidebar__icon-button" aria-label="Новая папка" onClick={() => setFolderModalOpen(true)}>
								<FolderPlus size={14} strokeWidth={1.9} />
							</button>
						</Tooltip>
					}
				/>
			</div>

			<div className="sidebar__footer">
				<ThemeSwitcher compact={collapsed} />
				{!collapsed && <StatusLine />}
				<Tooltip title={collapsed ? "Развернуть" : "Свернуть"} placement="right">
					<button type="button" className="sidebar__icon-button sidebar__collapse" aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"} onClick={toggleSidebar}>
						{collapsed ? <PanelLeftOpen size={16} strokeWidth={1.9} /> : <PanelLeftClose size={16} strokeWidth={1.9} />}
					</button>
				</Tooltip>
			</div>

			<AddOrEditFolderModal
				isOpen={folderModalOpen}
				onFinish={(values) => void addFolder(values)}
				onClose={() => setFolderModalOpen(false)}
			/>
		</aside>
	);
};
