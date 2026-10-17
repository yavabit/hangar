import { FC, useMemo, useState } from "react";
import { AppstoreOutlined, FolderOutlined, InboxOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import { Filters } from "@renderer/shared/components/Filters/Filters";
import { ProjectList } from "@renderer/shared/components/Project/ProjectList";
import { ProjectModal } from "@renderer/shared/components/Modals/ProjectModal";
import { ImportProjectsModal } from "@renderer/shared/components/Modals/ImportProjectsModal";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";
import { AddProjectButton } from "@renderer/shared/components/AddProjectButton/AddProjectButton";
import { RefreshStatusButton } from "@renderer/shared/components/RefreshStatusButton/RefreshStatusButton";
import { ProjectDropZone } from "@renderer/shared/components/ProjectDropZone/ProjectDropZone";
import { Section } from "@renderer/shared/components/Section/Section";
import { useAppStore } from "@renderer/store/app.store";
import { usePageFilters, useUiStore, type ProjectsView } from "@renderer/store/ui.store";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { applyProjectFilters, matchesFolder } from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";
import { Folders } from "./components/Folders/Folders";

export const Projects: FC = () => {
	const folders = useAppStore((s) => s.folders);
	const projects = useAppStore((s) => s.projects);
	const view = useUiStore((s) => s.view);
	const setView = useUiStore((s) => s.setView);
	const draggingProjectId = useUiStore((s) => s.draggingProjectId);
	const { filters, setFilters } = usePageFilters("projects");
	const { resolvePath } = usePathAliases();
	const { moveProject } = useProjects();

	const [addModalOpen, setAddModalOpen] = useState(false);
	const [importModalOpen, setImportModalOpen] = useState(false);

	const isSearching = filters.search.trim().length > 0;

	const folderIds = useMemo(() => new Set(folders.map((f) => f.id)), [folders]);

	const isUnfiled = (folderId?: string): boolean => !folderId || !folderIds.has(folderId);

	const unfiledProjects = useMemo(
		() => projects.filter((p) => !p.folderId || !folderIds.has(p.folderId)),
		[projects, folderIds],
	);

	const visibleFolders = useMemo(
		() => folders
			.filter((f) => matchesFolder(f, filters.search))
			.sort((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: "base" })),
		[folders, filters.search],
	);

	const visibleProjects = useMemo(
		() => applyProjectFilters(view === "all" || isSearching ? projects : unfiledProjects, filters, resolvePath),
		[projects, unfiledProjects, filters, view, isSearching, resolvePath],
	);

	const draggedProject = projects.find((p) => p.id === draggingProjectId);
	const showUnfiledDropTarget = !!draggedProject && !isUnfiled(draggedProject.folderId);

	const addButton = (
		<AddProjectButton onAdd={() => setAddModalOpen(true)} onImport={() => setImportModalOpen(true)} />
	);

	const unfiledDropTarget = showUnfiledDropTarget && (
		<ProjectDropZone onDropProject={(projectId) => void moveProject(projectId, null)}>
			<div className="unfiled-drop-target">
				<InboxOutlined /> Перетащите сюда, чтобы убрать проект из папки
			</div>
		</ProjectDropZone>
	);

	const renderContent = (): React.ReactNode => {
		if (projects.length === 0 && folders.length === 0) {
			return (
				<>
					<ProjectList
						items={[]}
						emptyDescription="Здесь пока пусто. Добавьте первый проект, импортируйте папку с проектами или создайте папку"
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
							{unfiledDropTarget}
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
				extra={
					<>
						<RefreshStatusButton />
						{addButton}
					</>
				}
			/>
			<Filters
				value={filters}
				onChange={setFilters}
				extra={
					<Segmented<ProjectsView>
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
			{view === "all" && unfiledDropTarget}
			{renderContent()}
			<ProjectModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
			<ImportProjectsModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
		</div>
	);
};
