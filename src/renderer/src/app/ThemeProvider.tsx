import { FC, ReactNode, useLayoutEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";
import ruRU from "antd/locale/ru_RU";
import { useEffectiveTheme, type EffectiveTheme } from "./theme";

const shared: ThemeConfig["token"] = {
	fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif",
	fontFamilyCode: "'Geist Mono Variable', Consolas, monospace",
	borderRadius: 10,
	borderRadiusLG: 14,
	borderRadiusSM: 7,
	colorBgLayout: "transparent",
	controlHeight: 34,
	wireframe: false,
};

const themes: Record<EffectiveTheme, ThemeConfig> = {
	light: {
		algorithm: antdTheme.defaultAlgorithm,
		token: {
			...shared,
			colorPrimary: "#5150d8",
			colorText: "#141821",
			colorTextSecondary: "#5b6272",
			colorBgContainer: "rgba(255, 255, 255, 0.66)",
			colorBgElevated: "#fbfcfe",
			colorBorder: "rgba(15, 23, 42, 0.12)",
			colorBorderSecondary: "rgba(15, 23, 42, 0.07)",
			colorFillTertiary: "rgba(15, 23, 42, 0.05)",
		},
		components: {
			Segmented: { trackBg: "rgba(15, 23, 42, 0.05)", itemSelectedBg: "#ffffff" },
			Tooltip: { colorBgSpotlight: "rgba(20, 24, 33, 0.92)" },
		},
	},
	dark: {
		algorithm: antdTheme.darkAlgorithm,
		token: {
			...shared,
			colorPrimary: "#6f6ff0",
			colorLink: "#a5a5ff",
			colorText: "#ecedef",
			colorTextSecondary: "#9a9eaa",
			colorBgContainer: "rgba(255, 255, 255, 0.04)",
			colorBgElevated: "#1a1c23",
			colorBorder: "rgba(255, 255, 255, 0.1)",
			colorBorderSecondary: "rgba(255, 255, 255, 0.07)",
			colorFillTertiary: "rgba(255, 255, 255, 0.06)",
		},
		components: {
			Segmented: { trackBg: "rgba(255, 255, 255, 0.05)", itemSelectedBg: "rgba(255, 255, 255, 0.12)" },
			Tooltip: { colorBgSpotlight: "rgba(38, 41, 51, 0.96)" },
		},
	},
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const theme = useEffectiveTheme();

	useLayoutEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);

	return (
		<ConfigProvider locale={ruRU} theme={themes[theme]}>
			{children}
		</ConfigProvider>
	);
};
