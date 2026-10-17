import { FC, useMemo, useState } from "react";
import { FolderPlus } from "lucide-react";
import { Folder } from "./Folder";
import { AddOrEditFolderModal } from "../Modals/AddFolderModal";

import "./Folders.scss";
import type { Folder as FolderType, Project } from "@schemas/store.schema";
import { useAppStore } from "@renderer/store/app.store";
import { useFolders } from "@renderer/shared/hooks/useFolders";
import { useProjects } from "@renderer/shared/hooks/useProjects";

type FoldersProps = {
	items: FolderType[];
	projects: Project[];
	showCreate?: boolean;
};

export const Folders: FC<FoldersProps> = ({ items, projects, showCreate = true }) => {
	const [modal, setModal] = useState<{ open: boolean; folder?: FolderType }>({ open: false });
	const health = useAppStore((s) => s.health);

	const { addFolder, removeFolder, updateFolder } = useFolders()
	const { moveProject } = useProjects()

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
			<div className="folders-grid">
				{items.map((folder) => (
					<Folder
						key={folder.id}
						folder={folder}
						projects={projectsByFolder.get(folder.id) ?? []}
						health={health}
						onDelete={removeFolder}
						onEdit={(f) => setModal({ open: true, folder: f })}
						onDropProject={(projectId, target) => void moveProject(projectId, target)}
					/>
				))}
				{showCreate && (
					<button type="button" className="folder-create" onClick={() => setModal({ open: true })}>
						<FolderPlus size={20} strokeWidth={1.8} />
						<span>Новая папка</span>
					</button>
				)}
			</div>
			<AddOrEditFolderModal
				isOpen={modal.open}
				editModalData={modal.folder}
				onFinish={handleSaveFolder}
				onClose={() => setModal((prev) => ({ ...prev, open: false }))}
			/>
		</div>
	);
};
