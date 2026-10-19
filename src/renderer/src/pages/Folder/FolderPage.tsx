import { FC, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Empty, Tooltip } from "antd";
import { FolderOpen, Layers, LayoutGrid, Pencil } from "lucide-react";
import { Filters } from "@renderer/shared/components/Filters/Filters";
import { ProjectList } from "@renderer/shared/components/Project/ProjectList";
import { ProjectModal } from "@renderer/shared/components/Modals/ProjectModal";
import { ImportProjectsModal } from "@renderer/shared/components/Modals/ImportProjectsModal";
import { PageHeader, type PageBreadcrumb } from "@renderer/shared/components/PageHeader/PageHeader";
import { AddProjectButton } from "@renderer/shared/components/AddProjectButton/AddProjectButton";
import { RefreshStatusButton } from "@renderer/shared/components/RefreshStatusButton/RefreshStatusButton";
import { Section } from "@renderer/shared/components/Section/Section";
import { AddOrEditFolderModal } from "@renderer/pages/Projects/components/Modals/AddFolderModal";
import { Folders } from "@renderer/pages/Projects/components/Folders/Folders";
import { useAppStore } from "@renderer/store/app.store";
import { usePageFilters, useUiStore } from "@renderer/store/ui.store";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import { useFolderTree } from "@renderer/shared/hooks/useFolderTree";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { applyProjectFilters, matchesFolder } from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";

const rootCrumb: PageBreadcrumb = { title: "Проекты", icon: <LayoutGrid size={13} />, to: "/" };

export const FolderPage: FC = () => {
	const { id = "" } = useParams();
	const navigate = useNavigate();

	const folder = useAppStore((s) => s.folders.find((f) => f.id === id));
	const projects = useAppStore((s) => s.projects);
	const tree = useFolderTree();
	const { addFolder, updateFolder, openFolderInIde } = useFolders();
	const { resolvePath } = usePathAliases();
	const { filters, setFilters } = usePageFilters(`folder:${id}`);
	const setSearch = useUiStore((s) => s.setSearch);

	const [addModalOpen, setAddModalOpen] = useState(false);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [subfolderModalOpen, setSubfolderModalOpen] = useState(false);

	const isSearching = filters.search.trim().length > 0;
	const subfolders = tree.childrenOf(id);
	const treeProjects = tree.projectsIn(id);

	const ownProjects = useMemo(() => projects.filter((p) => p.folderId === id), [projects, id]);
	const visibleProjects = useMemo(
		() => applyProjectFilters(isSearching ? treeProjects : ownProjects, filters, resolvePath),
		[isSearching, treeProjects, ownProjects, filters, resolvePath],
	);
	const matchedFolders = useMemo(
		() => (isSearching
			? tree.folders.filter((f) => f.id !== id && tree.pathOf(f.id).some((p) => p.id === id) && matchesFolder(f, filters.search))
			: []),
		[isSearching, tree, id, filters.search],
	);

	if (!folder) {
		return (
			<div>
				<PageHeader breadcrumbs={[rootCrumb]} title="Папка не найдена" />
				<Empty description="Возможно, папка была удалена">
					<Button type="primary" onClick={() => navigate("/")}>
						К списку проектов
					</Button>
				</Empty>
			</div>
		);
	}

	const canCreateSubfolder = tree.canCreateIn(folder.id);

	const addButton = (
		<AddProjectButton
			onAdd={() => setAddModalOpen(true)}
			onImport={() => setImportModalOpen(true)}
			onCreateFolder={canCreateSubfolder ? () => setSubfolderModalOpen(true) : undefined}
		/>
	);

	const breadcrumbs: PageBreadcrumb[] = [
		rootCrumb,
		...tree.pathOf(folder.id).map((f) => ({
			title: f.name,
			icon: <FolderOpen size={13} />,
			to: f.id === folder.id ? undefined : `/folder/${f.id}`,
		})),
	];

	const contents = [
		`${treeProjects.length} ${pluralize(treeProjects.length, ["проект", "проекта", "проектов"])}`,
		subfolders.length ? `${subfolders.length} ${pluralize(subfolders.length, ["папка", "папки", "папок"])}` : "",
	]
		.filter(Boolean)
		.join(" · ");

	const renderContent = (): React.ReactNode => {
		if (isSearching) {
			return matchedFolders.length === 0 && visibleProjects.length === 0 ? (
				<ProjectList items={[]} emptyDescription={`Ничего не найдено по запросу «${filters.search.trim()}»`} />
			) : (
				<>
					{matchedFolders.length > 0 && (
						<Section title="Папки" count={matchedFolders.length}>
							<Folders items={matchedFolders} showCreate={false} showPath />
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
				{subfolders.length > 0 && (
					<Section title="Папки" count={subfolders.length}>
						<Folders items={subfolders} parentId={folder.id} />
					</Section>
				)}
				{(ownProjects.length > 0 || subfolders.length === 0) && (
					<Section title={subfolders.length ? "Проекты в этой папке" : "Проекты"} count={ownProjects.length}>
						<ProjectList items={visibleProjects} emptyDescription="В этой папке пока нет проектов" emptyExtra={addButton} />
					</Section>
				)}
			</>
		);
	};

	return (
		<div>
			<PageHeader
				breadcrumbs={breadcrumbs}
				title={folder.name}
				description={folder.description ? `${folder.description} · ${contents}` : contents}
				extra={
					<>
						<RefreshStatusButton />
						<Tooltip title={treeProjects.length ? "Открыть все проекты папки и вложенных папок" : "В папке нет проектов"}>
							<Button
								icon={<Layers size={14} />}
								disabled={!treeProjects.length}
								onClick={() => void openFolderInIde(folder.id)}
							>
								Открыть всё в IDE
							</Button>
						</Tooltip>
						<Button icon={<Pencil size={14} />} onClick={() => setEditModalOpen(true)}>
							Редактировать
						</Button>
						{addButton}
					</>
				}
			/>
			<Filters
				value={filters}
				onChange={setFilters}
				placeholder={`Поиск в папке «${folder.name}»...`}
				scopeTag={{
					label: folder.name,
					icon: <FolderOpen size={12} />,
					onRemove: () => {
						setSearch("projects", filters.search);
						setSearch(`folder:${folder.id}`, "");
						navigate("/");
					},
				}}
			/>
			{renderContent()}
			<ProjectModal
				isOpen={addModalOpen}
				defaults={{ folderId: folder.id }}
				onClose={() => setAddModalOpen(false)}
			/>
			<ImportProjectsModal
				isOpen={importModalOpen}
				defaultFolderId={folder.id}
				onClose={() => setImportModalOpen(false)}
			/>
			<AddOrEditFolderModal
				isOpen={editModalOpen}
				editModalData={folder}
				onFinish={(values) => void updateFolder(folder.id, values)}
				onClose={() => setEditModalOpen(false)}
			/>
			<AddOrEditFolderModal
				isOpen={subfolderModalOpen}
				defaultParentId={folder.id}
				onFinish={(values) => void addFolder(values)}
				onClose={() => setSubfolderModalOpen(false)}
			/>
		</div>
	);
};
