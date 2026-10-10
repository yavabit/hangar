import { FC, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Empty } from "antd";
import { EditOutlined, FolderOpenOutlined, FolderOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons";
import { Filters } from "@renderer/shared/components/Filters/Filters";
import { ProjectList } from "@renderer/shared/components/Project/ProjectList";
import { ProjectModal } from "@renderer/shared/components/Modals/ProjectModal";
import { PageHeader, type PageBreadcrumb } from "@renderer/shared/components/PageHeader/PageHeader";
import { AddOrEditFolderModal } from "@renderer/pages/Projects/components/Modals/AddFolderModal";
import { useAppStore } from "@renderer/store/app.store";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import {
	applyProjectFilters,
	DEFAULT_PROJECT_FILTERS,
	type ProjectFiltersValue,
} from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";

const rootCrumb: PageBreadcrumb = { title: "Проекты", icon: <HomeOutlined />, to: "/" };

export const FolderPage: FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const folder = useAppStore((s) => s.folders.find((f) => f.id === id));
	const projects = useAppStore((s) => s.projects);
	const { updateFolder } = useFolders();

	const [filters, setFilters] = useState<ProjectFiltersValue>(DEFAULT_PROJECT_FILTERS);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);

	const folderProjects = useMemo(() => projects.filter((p) => p.folderId === id), [projects, id]);
	const visibleProjects = useMemo(() => applyProjectFilters(folderProjects, filters), [folderProjects, filters]);

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
		<Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
			Новый проект
		</Button>
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
						<Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
							Редактировать
						</Button>
						{addButton}
					</>
				}
			/>
			<Filters value={filters} onChange={setFilters} />
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
			<AddOrEditFolderModal
				isOpen={editModalOpen}
				editModalData={folder}
				onFinish={(values) => updateFolder(folder.id, values)}
				onClose={() => setEditModalOpen(false)}
			/>
		</div>
	);
};
