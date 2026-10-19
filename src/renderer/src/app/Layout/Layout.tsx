import { FC, useEffect } from "react";
import { Search } from "lucide-react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import { useUiStore } from "@renderer/store/ui.store";
import { CommandPalette } from "@renderer/shared/components/CommandPalette/CommandPalette";
import logo from "@renderer/shared/assets/logo/logo.svg";
import { Sidebar } from "./Sidebar";

import "./Layout.scss";

/**
 * Каркас главного окна: своя шапка вместо системной, стеклянный сайдбар и контент.
 * Страницы переключаются без анимации: сдвиг страницы со стеклянными блоками заставляет GPU
 * при каждом запуске собирать тяжёлые шейдеры, и первый переход заметно подтормаживает
 */
export const FullLayout: FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const outlet = useOutlet();
	const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);

	useEffect(() => window.api.app.onNavigate((route) => navigate(route)), [navigate]);

	return (
		<div className="shell">
			<header className="titlebar">
				<div className="titlebar__brand">
					<img src={logo} alt="" className="titlebar__logo" />
					<span>Hangar</span>
				</div>
				<button type="button" className="titlebar__search" onClick={() => setPaletteOpen(true)}>
					<Search size={14} strokeWidth={2} />
					<span className="titlebar__search-text">Найти проект или папку</span>
					<kbd>Ctrl K</kbd>
				</button>
				<div className="titlebar__end" />
			</header>

			<div className="shell__body">
				<Sidebar />
				<main className="shell__content">
					<div key={location.pathname} className="shell__page">
						{outlet}
					</div>
				</main>
			</div>

			<CommandPalette />
		</div>
	);
};
