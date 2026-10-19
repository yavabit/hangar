import { useEffect } from "react";
import { useAppStore } from "@renderer/store/app.store";

/**
 * Загружает данные и подписывается на изменения из main. Нужен каждому окну:
 * главному и окну быстрого поиска — у каждого свой renderer и своё состояние.
 */
export const useAppSync = (): void => {
	const load = useAppStore((s) => s.load);
	const hydrated = useAppStore((s) => s.hydrated);
	const windowInfo = useAppStore((s) => s.window);
	const setProjects = useAppStore((s) => s.setProjects);
	const setFolders = useAppStore((s) => s.setFolders);
	const setHealth = useAppStore((s) => s.setHealth);
	const setCheckedAt = useAppStore((s) => s.setCheckedAt);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		const unsubscribers = [
			window.api.projects.onChanged(setProjects),
			window.api.folders.onChanged(setFolders),
			window.api.projects.onHealth(setHealth),
			window.api.projects.onCheckedAt(setCheckedAt),
		];

		return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
	}, [setProjects, setFolders, setHealth, setCheckedAt]);

	useEffect(() => {
		if (!hydrated) {
			return;
		}

		const root = document.documentElement;
		root.classList.toggle("has-mica", windowInfo.mica);
		root.classList.add(`platform-${windowInfo.platform}`);
	}, [hydrated, windowInfo]);
};
