import { FC, useState } from "react";
import { Button, Flex, Typography, message } from "antd";
import { FolderOpenOutlined, FolderAddOutlined } from "@ant-design/icons";
import { api } from "@renderer/shared/api";

const { Text } = Typography;

type SelectFolderProps = {
	onSelect: (path: string) => void;
	path?: string;
};

export const SelectFolder: FC<SelectFolderProps> = ({ onSelect, path }) => {
	const [localPath, setLocalPath] = useState<string | undefined>(path);
	const [loading, setLoading] = useState<boolean>(false);

	const handleSelectFolder = async (): Promise<void> => {
		if (!api.fileSystem.selectFolder) {
			message.warning("Функция выбора папки недоступна.");
			return;
		}

		setLoading(true);
		try {
			const folderPath = await api.fileSystem.selectFolder();
			if (folderPath) {
				setLocalPath(folderPath);
				onSelect?.(folderPath);
				message.success(`Выбрана папка: ${folderPath}`);
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
				style={{
					flex: 1,
					fontSize: 14,
					color: localPath ? "#333" : "#bfbfbf",
					fontFamily: "monospace",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{localPath || "Папка не выбрана"}
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
