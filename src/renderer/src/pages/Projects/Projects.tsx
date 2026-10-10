import { FC, useMemo, useState } from "react";
import { AppstoreOutlined, FolderOutlined, PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Segmented } from "antd";
import { Filters } from "@renderer/shared/components/Filters/Filters";
import { ProjectList } from "@renderer/shared/components/Project/ProjectList";
import { ProjectModal } from "@renderer/shared/components/Modals/ProjectModal";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";
import { Section } from "@renderer/shared/components/Section/Section";
import { useAppStore } from "@renderer/store/app.store";
import {
	applyProjectFilters,
	DEFAULT_PROJECT_FILTERS,
	matchesFolder,
	type ProjectFiltersValue,
} from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";
import { Folders } from "./components/Folders/Folders";

type ViewMode = "folders" | "all";

export const Projects: FC = () => {
	const folders = useAppStore((s) => s.folders);
	const projects = useAppStore((s) => s.projects);

	const [filters, setFilters] = useState<ProjectFiltersValue>(DEFAULT_PROJECT_FILTERS);
	const [view, setView] = useState<ViewMode>("folders");
	const [addModalOpen, setAddModalOpen] = useState(false);

	const isSearching = filters.search.trim().length > 0;

	const unfiledProjects = useMemo(() => {
		const folderIds = new Set(folders.map((f) => f.id));
		return projects.filter((p) => !p.folderId || !folderIds.has(p.folderId));
	}, [projects, folders]);

	const visibleFolders = useMemo(
		() => folders
			.filter((f) => matchesFolder(f, filters.search))
			.sort((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: "base" })),
		[folders, filters.search],
	);

	const visibleProjects = useMemo(
		() => applyProjectFilters(view === "all" || isSearching ? projects : unfiledProjects, filters),
		[projects, unfiledProjects, filters, view, isSearching],
	);

	const addButton = (
		<Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
			Новый проект
		</Button>
	);

	const renderContent = (): React.ReactNode => {
		if (projects.length === 0 && folders.length === 0) {
			return (
				<>
					<ProjectList
						items={[]}
						emptyDescription="Здесь пока пусто. Добавьте первый проект или создайте папку"
						emptyExtra={addButton}
					/>
					<Section title="Папки" count={0}>
						<Folders items={[]} projects={projects} />
					</Section>
				</>
			);
		}

		if (view === "all") {
			return (
				<Section title="Все проекты" count={visibleProjects.length}>
					<ProjectList
						items={visibleProjects}
						showFolder
						emptyDescription={isSearching ? `Ничего не найдено по запросу «${filters.search.trim()}»` : "Проектов пока нет"}
						emptyExtra={isSearching ? undefined : addButton}
					/>
				</Section>
			);
		}

		if (isSearching) {
			const nothingFound = visibleFolders.length === 0 && visibleProjects.length === 0;

			return nothingFound ? (
				<ProjectList items={[]} emptyDescription={`Ничего не найдено по запросу «${filters.search.trim()}»`} />
			) : (
				<>
					{visibleFolders.length > 0 && (
						<Section title="Папки" count={visibleFolders.length}>
							<Folders items={visibleFolders} projects={projects} showCreate={false} />
						</Section>
					)}
					{visibleProjects.length > 0 && (
						<Section title="Проекты" count={visibleProjects.length}>
							<ProjectList items={visibleProjects} showFolder />
						</Section>
					)}
				</>
			);
		}

		return (
			<>
				<Section title="Папки" count={folders.length}>
					<Folders items={visibleFolders} projects={projects} />
				</Section>
				{visibleProjects.length > 0 && (
					<Section title="Без папки" count={visibleProjects.length}>
						<ProjectList items={visibleProjects} />
					</Section>
				)}
			</>
		);
	};

	return (
		<div>
			<PageHeader
				icon={<AppstoreOutlined />}
				title="Проекты"
				description={`${projects.length} ${pluralize(projects.length, ["проект", "проекта", "проектов"])} · ${folders.length} ${pluralize(folders.length, ["папка", "папки", "папок"])}`}
				extra={addButton}
			/>
			<Filters
				value={filters}
				onChange={setFilters}
				extra={
					<Segmented<ViewMode>
						size="large"
						value={view}
						onChange={setView}
						options={[
							{ value: "folders", label: "По папкам", icon: <FolderOutlined /> },
							{ value: "all", label: "Все проекты", icon: <UnorderedListOutlined /> },
						]}
					/>
				}
			/>
			{renderContent()}
			<ProjectModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
		</div>
	);
};
