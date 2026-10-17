import { FC } from "react";
import { Button, Dropdown, Space } from "antd";
import { DownOutlined, ImportOutlined, PlusOutlined } from "@ant-design/icons";

type AddProjectButtonProps = {
	onAdd: () => void;
	onImport: () => void;
};

/** «Новый проект» с дополнительным пунктом «Импорт из папки» */
export const AddProjectButton: FC<AddProjectButtonProps> = ({ onAdd, onImport }) => (
	<Space.Compact>
		<Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
			Новый проект
		</Button>
		<Dropdown
			placement="bottomRight"
			menu={{
				items: [{ key: "import", icon: <ImportOutlined />, label: "Импорт из папки…", onClick: onImport }],
			}}
		>
			<Button type="primary" icon={<DownOutlined />} aria-label="Другие способы добавить проект" />
		</Dropdown>
	</Space.Compact>
);
