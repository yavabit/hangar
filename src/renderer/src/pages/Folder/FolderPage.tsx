import { FC, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Empty } from "antd";
import { EditOutlined, FolderOpenOutlined, FolderOutlined, HomeOutlined } from "@ant-design/icons";
import { Filters } from "@renderer/shared/components/Filters/Filters";
import { ProjectList } from "@renderer/shared/components/Project/ProjectList";
import { ProjectModal } from "@renderer/shared/components/Modals/ProjectModal";
import { ImportProjectsModal } from "@renderer/shared/components/Modals/ImportProjectsModal";
import { PageHeader, type PageBreadcrumb } from "@renderer/shared/components/PageHeader/PageHeader";
import { AddProjectButton } from "@renderer/shared/components/AddProjectButton/AddProjectButton";
import { RefreshStatusButton } from "@renderer/shared/components/RefreshStatusButton/RefreshStatusButton";
import { AddOrEditFolderModal } from "@renderer/pages/Projects/components/Modals/AddFolderModal";
import { useAppStore } from "@renderer/store/app.store";
import { usePageFilters, useUiStore } from "@renderer/store/ui.store";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { applyProjectFilters } from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";

const rootCrumb: PageBreadcrumb = { title: "Проекты", icon: <HomeOutlined />, to: "/" };

export const FolderPage: FC = () => {
	const { id = "" } = useParams();
	const navigate = useNavigate();

	const folder = useAppStore((s) => s.folders.find((f) => f.id === id));
	const projects = useAppStore((s) => s.projects);
	const { updateFolder } = useFolders();
	const { resolvePath } = usePathAliases();
	const { filters, setFilters } = usePageFilters(`folder:${id}`);
	const setSearch = useUiStore((s) => s.setSearch);

	const [addModalOpen, setAddModalOpen] = useState(false);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);

	const folderProjects = useMemo(() => projects.filter((p) => p.folderId === id), [projects, id]);
	const visibleProjects = useMemo(
		() => applyProjectFilters(folderProjects, filters, resolvePath),
		[folderProjects, filters, resolvePath],
	);

	if (!folder) {
		return (
			<div>
				<PageHeader breadcrumbs={[rootCrumb]} icon={<FolderOutlined />} title="Папка не найдена" />
				<Empty description="Возможно, папка была удалена">
					<Button type="primary" onClick={() => navigate("/")}>
						К списку проектов
					</Button>
				</Empty>
			</div>
		);
	}

	const addButton = (
		<AddProjectButton onAdd={() => setAddModalOpen(true)} onImport={() => setImportModalOpen(true)} />
	);

	const projectsCount = `${folderProjects.length} ${pluralize(folderProjects.length, ["проект", "проекта", "проектов"])}`;

	return (
		<div>
			<PageHeader
				breadcrumbs={[rootCrumb, { title: folder.name, icon: <FolderOpenOutlined /> }]}
				icon={<FolderOpenOutlined />}
				title={folder.name}
				description={folder.description ? `${folder.description} · ${projectsCount}` : projectsCount}
				extra={
					<>
						<RefreshStatusButton />
						<Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
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
					icon: <FolderOpenOutlined />,
					onRemove: () => {
						setSearch("projects", filters.search);
						setSearch(`folder:${folder.id}`, "");
						navigate("/");
					},
				}}
			/>
			<ProjectList
				items={visibleProjects}
				emptyDescription={
					folderProjects.length === 0
						? "В этой папке пока нет проектов"
						: `Ничего не найдено по запросу «${filters.search.trim()}»`
				}
				emptyExtra={folderProjects.length === 0 ? addButton : undefined}
			/>
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
				onFinish={(values) => updateFolder(folder.id, values)}
				onClose={() => setEditModalOpen(false)}
			/>
		</div>
	);
};
