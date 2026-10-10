import { FC, useState } from "react";
import { Folder } from "./Folder";
import { Col, Row } from "antd";
import { ProjectCardWrapper } from "@renderer/shared/components/UI/ProjectCardWrapper/ProjectCardWrapper";
import { PlusOutlined } from "@ant-design/icons";
import { AddOrEditFolderModal } from "../Modals/AddFolderModal";

import "./Folders.scss";
import type { Folder as FolderType } from "@schemas/store.schema";
import { useFolders } from "@renderer/shared/hooks/useFolders";

const AddFolder: FC = () => {
	return (
		<ProjectCardWrapper type="folder">
			<div className="add-folder">
				<div style={{ fontSize: 40, color: "gray" }}>
					<PlusOutlined />
				</div>
				<div style={{ marginLeft: "auto", fontSize: 25, color: "gray" }}>
					Создать папку
				</div>
			</div>
		</ProjectCardWrapper>
	);
};

type FolderProps = {
	items: FolderType[];
};

export const Folders: FC<FolderProps> = ({ items }) => {
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [editModalData, setEditModalData] = useState<FolderType>();

	const { addFolder, removeFolder, updateFolder } = useFolders()

	const handleAddFolder = async (folder: FolderType, id?: FolderType["id"]): Promise<void> => {
		if (id) {
			await updateFolder(id, { ...folder});
		} else {
			await addFolder(folder);
		}
	};

	const handleFolderEdit = (folder: FolderType): void => {
		setEditModalData(folder);
		setAddModalOpen(true);
	};

	const handleCloseModal = (): void => {
		setAddModalOpen(false);
		setEditModalData(undefined);
	}

	return (
		<div>
			<Row gutter={[16, 16]}>
				{" "}
				{/* 16px отступы между колонками по горизонтали и вертикали */}
				<Col
					xs={24}
					sm={12}
					md={8}
					lg={6}
					xl={4}
					style={{ minWidth: 350 }}
					onClick={() => setAddModalOpen(true)}
				>
					<AddFolder />
				</Col>
				{items.map((folder) => (
					<Col
						key={folder.id}
						xs={24} // 1 элемент в строку (на всю ширину)
						sm={12} // 2 элемента в строку
						md={8} // 3 элемента в строку
						lg={6} // 4 элемента в строку
						xl={4} // 5-6 элементов в строку
						style={{ minWidth: 350, cursor: "pointer" }}
					>
						<Folder folder={folder} onDelete={removeFolder} onEdit={handleFolderEdit} />
					</Col>
				))}
			</Row>
			<AddOrEditFolderModal
				isOpen={addModalOpen}
				editModalData={editModalData}
				onFinish={handleAddFolder}
				onClose={handleCloseModal}
			/>
		</div>
	);
};
