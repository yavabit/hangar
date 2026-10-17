import { useEffect, useState } from "react";

export type EffectiveTheme = "light" | "dark";

const darkQuery = (): MediaQueryList => window.matchMedia("(prefers-color-scheme: dark)");

/**
 * Тема, которую сейчас показывает окно. Выбор «светлая / тёмная / системная» main-процесс
 * применяет через nativeTheme, а Chromium отражает его в prefers-color-scheme во всех окнах.
 */
export const getEffectiveTheme = (): EffectiveTheme => (darkQuery().matches ? "dark" : "light");

export const useEffectiveTheme = (): EffectiveTheme => {
	const [theme, setTheme] = useState<EffectiveTheme>(getEffectiveTheme);

	useEffect(() => {
		const query = darkQuery();
		const handleChange = (): void => setTheme(getEffectiveTheme());
		query.addEventListener("change", handleChange);
		return () => query.removeEventListener("change", handleChange);
	}, []);

	return theme;
};
