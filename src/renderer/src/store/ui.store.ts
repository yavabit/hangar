import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Project } from "@schemas/store.schema";
import type { ProjectFiltersValue, ProjectSort } from "@renderer/shared/utils/projectFilters";

export type ProjectsView = "folders" | "all";

/** Страницы со своим поиском */
export type SearchScope = "projects" | "favorites" | `folder:${string}`;

type UiStore = {
	/** Сортировка общая для всех страниц и сохраняется между запусками */
	sort: ProjectSort;
	view: ProjectsView;
	/** Поиск у каждой страницы свой и живёт до закрытия приложения */
	search: Partial<Record<SearchScope, string>>;
	/** Проект, который сейчас перетаскивают */
	draggingProjectId: Project["id"] | null;

	setSort: (sort: ProjectSort) => void;
	setView: (view: ProjectsView) => void;
	setSearch: (scope: SearchScope, value: string) => void;
	setDraggingProjectId: (id: Project["id"] | null) => void;
};

/** localStorage может быть недоступен — тогда настройки просто не сохраняются */
const safeLocalStorage = createJSONStorage(() => {
	try {
		return window.localStorage;
	} catch {
		return {
			getItem: () => null,
			setItem: () => undefined,
			removeItem: () => undefined,
		};
	}
});

export const useUiStore = create<UiStore>()(
	persist(
		(set) => ({
			sort: "opened",
			view: "folders",
			search: {},
			draggingProjectId: null,

			setSort: (sort) => set({ sort }),
			setView: (view) => set({ view }),
			setSearch: (scope, value) => set((state) => ({ search: { ...state.search, [scope]: value } })),
			setDraggingProjectId: (draggingProjectId) => set({ draggingProjectId }),
		}),
		{
			name: "project-launcher-ui",
			storage: safeLocalStorage,
			partialize: (state) => ({ sort: state.sort, view: state.view }),
		},
	),
);

/** Фильтры страницы: поиск этой страницы и общая сортировка */
export const usePageFilters = (
	scope: SearchScope,
): { filters: ProjectFiltersValue; setFilters: (value: ProjectFiltersValue) => void } => {
	const search = useUiStore((s) => s.search[scope] ?? "");
	const sort = useUiStore((s) => s.sort);
	const setSearch = useUiStore((s) => s.setSearch);
	const setSort = useUiStore((s) => s.setSort);

	const filters = useMemo(() => ({ search, sort }), [search, sort]);

	const setFilters = (value: ProjectFiltersValue): void => {
		if (value.search !== search) {
			setSearch(scope, value.search);
		}
		if (value.sort !== sort) {
			setSort(value.sort);
		}
	};

	return { filters, setFilters };
};
