import { FC, useMemo, useState } from "react";
import { Folder } from "./Folder";
import { Col, Row } from "antd";
import { ProjectCardWrapper } from "@renderer/shared/components/UI/ProjectCardWrapper/ProjectCardWrapper";
import { PlusOutlined } from "@ant-design/icons";
import { AddOrEditFolderModal } from "../Modals/AddFolderModal";

import "./Folders.scss";
import type { Folder as FolderType, Project } from "@schemas/store.schema";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import { getLatestActivity } from "@renderer/shared/utils/projectFilters";

const AddFolder: FC<{ onClick: () => void }> = ({ onClick }) => {
	return (
		<ProjectCardWrapper type="folder" onCardClick={onClick} className="add-folder-card">
			<div className="add-folder">
				<PlusOutlined className="add-folder__icon" />
				<span className="add-folder__text">Создать папку</span>
			</div>
		</ProjectCardWrapper>
	);
};

type FoldersProps = {
	items: FolderType[];
	projects: Project[];
	showCreate?: boolean;
};

export const Folders: FC<FoldersProps> = ({ items, projects, showCreate = true }) => {
	const [modal, setModal] = useState<{ open: boolean; folder?: FolderType }>({ open: false });

	const { addFolder, removeFolder, updateFolder } = useFolders()

	const projectsByFolder = useMemo(() => {
		const map = new Map<FolderType["id"], Project[]>();
		for (const project of projects) {
			if (project.folderId) {
				map.set(project.folderId, [...(map.get(project.folderId) ?? []), project]);
			}
		}
		return map;
	}, [projects]);

	const handleSaveFolder = async (folder: Pick<FolderType, "name" | "description">, id?: FolderType["id"]): Promise<void> => {
		if (id) {
			await updateFolder(id, folder);
		} else {
			await addFolder(folder);
		}
	};

	return (
		<div>
			<Row gutter={[16, 16]}>
				{/* 16px отступы между колонками по горизонтали и вертикали */}
				{showCreate && (
					<Col
						xs={24}
						sm={12}
						md={8}
						lg={6}
						xl={4}
						style={{ minWidth: 350 }}
					>
						<AddFolder onClick={() => setModal({ open: true })} />
					</Col>
				)}
				{items.map((folder) => {
					const folderProjects = projectsByFolder.get(folder.id) ?? [];

					return (
						<Col
							key={folder.id}
							xs={24} // 1 элемент в строку (на всю ширину)
							sm={12} // 2 элемента в строку
							md={8} // 3 элемента в строку
							lg={6} // 4 элемента в строку
							xl={4} // 5-6 элементов в строку
							style={{ minWidth: 350 }}
						>
							<Folder
								folder={folder}
								projectsCount={folderProjects.length}
								lastActivity={getLatestActivity(folderProjects)}
								onDelete={removeFolder}
								onEdit={(f) => setModal({ open: true, folder: f })}
							/>
						</Col>
					);
				})}
			</Row>
			<AddOrEditFolderModal
				isOpen={modal.open}
				editModalData={modal.folder}
				onFinish={handleSaveFolder}
				onClose={() => setModal((prev) => ({ ...prev, open: false }))}
			/>
		</div>
	);
};
