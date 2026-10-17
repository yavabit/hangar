import { FC, useState } from "react";
import { Button, Flex, Typography, message } from "antd";
import { FolderOpenOutlined, FolderAddOutlined } from "@ant-design/icons";
import { api } from "@renderer/shared/api";

const { Text } = Typography;

type SelectFolderProps = {
	value?: string;
	onChange?: (path: string) => void;
	onSelect?: (path: string) => void;
	path?: string;
};

export const SelectFolder: FC<SelectFolderProps> = ({ value, onChange, onSelect, path }) => {
	const [localPath, setLocalPath] = useState<string | undefined>(path);
	const [loading, setLoading] = useState<boolean>(false);

	const currentPath = value ?? localPath;

	const handleSelectFolder = async (): Promise<void> => {
		setLoading(true);
		try {
			const folderPath = await api.fileSystem.selectFolder(currentPath || undefined);
			if (folderPath) {
				setLocalPath(folderPath);
				onChange?.(folderPath);
				onSelect?.(folderPath);
			}
		} catch (error: unknown) {
			message.error("Ошибка при выборе папки");
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Flex
			gap={8}
			align="center"
			style={{
				padding: "4px 11px",
				border: "1px solid #d9d9d9",
				borderRadius: "6px",
				background: "#f5f5f5",
				minHeight: 32,
			}}
		>
			<FolderOpenOutlined style={{ color: "#bfbfbf" }} />
			<Text
				title={currentPath}
				style={{
					flex: 1,
					fontSize: 14,
					color: currentPath ? "#333" : "#bfbfbf",
					fontFamily: "monospace",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{currentPath || "Папка не выбрана"}
			</Text>
			<Button
				type="text"
				size="small"
				icon={<FolderAddOutlined />}
				onClick={handleSelectFolder}
				loading={loading}
			>
				Обзор
			</Button>
		</Flex>
	);
};
