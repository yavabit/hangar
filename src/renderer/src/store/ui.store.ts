import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Project } from "@schemas/store.schema";
import type { ProjectFiltersValue, ProjectSort } from "@renderer/shared/utils/projectFilters";

export type ProjectsView = "folders" | "all";

export type ProjectsLayout = "grid" | "list";

/** Страницы со своим поиском */
export type SearchScope = "projects" | "favorites" | `folder:${string}`;

type UiStore = {
	/** Сортировка общая для всех страниц и сохраняется между запусками */
	sort: ProjectSort;
	view: ProjectsView;
	/** Карточки или плотный список */
	layout: ProjectsLayout;
	/** Поиск у каждой страницы свой и живёт до закрытия приложения */
	search: Partial<Record<SearchScope, string>>;
	/** Проект, который сейчас перетаскивают */
	draggingProjectId: Project["id"] | null;
	/** Проект, который только что запустили: карточка коротко подсвечивается */
	launchingProjectId: Project["id"] | null;
	/** Поиск по Ctrl+K внутри главного окна */
	paletteOpen: boolean;
	sidebarCollapsed: boolean;

	setSort: (sort: ProjectSort) => void;
	setView: (view: ProjectsView) => void;
	setLayout: (layout: ProjectsLayout) => void;
	setSearch: (scope: SearchScope, value: string) => void;
	setDraggingProjectId: (id: Project["id"] | null) => void;
	markLaunching: (id: Project["id"]) => void;
	setPaletteOpen: (open: boolean) => void;
	toggleSidebar: () => void;
};

const LAUNCH_HIGHLIGHT_MS = 900;

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
			layout: "grid",
			search: {},
			draggingProjectId: null,
			launchingProjectId: null,
			paletteOpen: false,
			sidebarCollapsed: false,

			setSort: (sort) => set({ sort }),
			setView: (view) => set({ view }),
			setLayout: (layout) => set({ layout }),
			setSearch: (scope, value) => set((state) => ({ search: { ...state.search, [scope]: value } })),
			setDraggingProjectId: (draggingProjectId) => set({ draggingProjectId }),
			setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
			toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
			markLaunching: (id) => {
				set({ launchingProjectId: id });
				setTimeout(() => set((state) => (state.launchingProjectId === id ? { launchingProjectId: null } : {})), LAUNCH_HIGHLIGHT_MS);
			},
		}),
		{
			name: "hangar-ui",
			storage: safeLocalStorage,
			partialize: (state) => ({
				sort: state.sort,
				view: state.view,
				layout: state.layout,
				sidebarCollapsed: state.sidebarCollapsed,
			}),
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
