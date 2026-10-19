import { FC } from "react";
import { Button, Dropdown, Space } from "antd";
import { ChevronDown, FolderPlus, FolderSearch, Plus } from "lucide-react";

type AddProjectButtonProps = {
	onAdd: () => void;
	onImport: () => void;
	/** Пункт «Новая подпапка» — на странице папки */
	onCreateFolder?: () => void;
};

/** «Новый проект» с дополнительным пунктом «Импорт из папки» */
export const AddProjectButton: FC<AddProjectButtonProps> = ({ onAdd, onImport, onCreateFolder }) => (
	<Space.Compact>
		<Button type="primary" icon={<Plus size={16} strokeWidth={2.2} />} onClick={onAdd}>
			Новый проект
		</Button>
		<Dropdown
			placement="bottomRight"
			menu={{
				items: [
					{ key: "import", icon: <FolderSearch size={15} />, label: "Импорт из папки…", onClick: onImport },
					...(onCreateFolder ? [{ key: "folder", icon: <FolderPlus size={15} />, label: "Новая подпапка", onClick: onCreateFolder }] : []),
				],
			}}
		>
			<Button type="primary" icon={<ChevronDown size={15} />} aria-label="Другие способы добавить проект" />
		</Dropdown>
	</Space.Compact>
);
