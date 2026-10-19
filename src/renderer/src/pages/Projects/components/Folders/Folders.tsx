import { FC, useState } from "react";
import { FolderPlus } from "lucide-react";
import { Folder } from "./Folder";
import { AddOrEditFolderModal, type FolderFormValues } from "../Modals/AddFolderModal";

import "./Folders.scss";
import type { Folder as FolderType } from "@schemas/store.schema";
import { useAppStore } from "@renderer/store/app.store";
import { useUiStore } from "@renderer/store/ui.store";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import { useFolderTree } from "@renderer/shared/hooks/useFolderTree";
import { useProjects } from "@renderer/shared/hooks/useProjects";

type FoldersProps = {
	items: FolderType[];
	/** Папка, внутри которой показан список: в неё создаются новые папки */
	parentId?: FolderType["id"];
	showCreate?: boolean;
	showPath?: boolean;
};

export const Folders: FC<FoldersProps> = ({ items, parentId, showCreate = true, showPath = false }) => {
	const [modal, setModal] = useState<{ open: boolean; folder?: FolderType }>({ open: false });
	const health = useAppStore((s) => s.health);
	const layout = useUiStore((s) => s.layout);
	const tree = useFolderTree();

	const { addFolder, removeFolder, updateFolder, moveFolder, openFolderInIde } = useFolders();
	const { moveProject } = useProjects();

	const canCreate = showCreate && tree.canCreateIn(parentId);

	const handleSaveFolder = async (folder: FolderFormValues, id?: FolderType["id"]): Promise<void> => {
		if (id) {
			await updateFolder(id, folder);
		} else {
			await addFolder(folder);
		}
	};

	return (
		<div>
			<div className={layout === "list" ? "folders-rows project-list-rows glass" : "folders-grid"}>
				{canCreate && (
					<button
						type="button"
						className={`folder-create ${layout === "list" ? "folder-create--row" : ""}`}
						onClick={() => setModal({ open: true })}
					>
						<FolderPlus size={layout === "list" ? 16 : 20} strokeWidth={1.8} />
						<span>{parentId ? "Новая подпапка" : "Новая папка"}</span>
					</button>
				)}
				{items.map((folder) => (
					<Folder
						key={folder.id}
						folder={folder}
						health={health}
						layout={layout}
						showPath={showPath}
						onDelete={removeFolder}
						onEdit={(f) => setModal({ open: true, folder: f })}
						onOpenAll={(f) => void openFolderInIde(f.id)}
						onDropProject={(projectId, target) => void moveProject(projectId, target)}
						onDropFolder={(folderId, target) => void moveFolder(folderId, target.id)}
					/>
				))}
			</div>
			<AddOrEditFolderModal
				isOpen={modal.open}
				editModalData={modal.folder}
				defaultParentId={parentId}
				onFinish={handleSaveFolder}
				onClose={() => setModal((prev) => ({ ...prev, open: false }))}
			/>
		</div>
	);
};
