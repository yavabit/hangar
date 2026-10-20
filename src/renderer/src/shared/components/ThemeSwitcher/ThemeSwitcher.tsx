import { FC } from "react";
import { Segmented } from "antd";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemeMode } from "@schemas/store.schema";
import { useSettings } from "@renderer/shared/hooks/useSettings";

const OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
	{ value: "light", label: "Светлая", icon: <Sun size={14} strokeWidth={2} /> },
	{ value: "dark", label: "Тёмная", icon: <Moon size={14} strokeWidth={2} /> },
	{ value: "system", label: "Как в системе", icon: <Monitor size={14} strokeWidth={2} /> },
];

type ThemeSwitcherProps = {
	/** Одна кнопка, которая перебирает темы по кругу — для свёрнутого сайдбара */
	compact?: boolean;
	/** Показывать подписи рядом со значками */
	withLabels?: boolean;
};

export const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ compact = false, withLabels = false }) => {
	const { settings, updateSettings } = useSettings();
	const current = settings.appearance.theme;

	const setTheme = (theme: ThemeMode): void => {
		void updateSettings({ ...settings, appearance: { theme } }, { silent: true });
	};

	if (compact) {
		const index = OPTIONS.findIndex((o) => o.value === current);
		const option = OPTIONS[index];
		const next = OPTIONS[(index + 1) % OPTIONS.length];

		return (
			<Tooltip title={`Тема: ${option.label.toLowerCase()}. Нажмите для: ${next.label.toLowerCase()}`} placement="right">
				<button type="button" className="sidebar__icon-button" aria-label="Сменить тему" onClick={() => setTheme(next.value)}>
					{option.icon}
				</button>
			</Tooltip>
		);
	}

	return (
		<Segmented<ThemeMode>
			block={!withLabels}
			value={current}
			onChange={setTheme}
			options={OPTIONS.map((option) => ({
				value: option.value,
				label: withLabels ? option.label : <Tooltip title={option.label}><span className="theme-switcher__icon">{option.icon}</span></Tooltip>,
				icon: withLabels ? option.icon : undefined,
			}))}
		/>
	);
};
