import { FC, useState } from "react";
import { Button, Flex, Typography, message } from "antd";
import { FolderOpen, FolderPlus } from "lucide-react";
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
				border: "1px solid var(--divider)",
				borderRadius: 10,
				background: "var(--input-bg)",
				minHeight: 32,
			}}
		>
			<FolderOpen size={15} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
			<Text
				title={currentPath}
				style={{
					flex: 1,
					color: currentPath ? "var(--text)" : "var(--text-faint)",
					fontFamily: "var(--font-mono)",
					fontSize: 13,
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
				icon={<FolderPlus size={14} />}
				onClick={handleSelectFolder}
				loading={loading}
			>
				Обзор
			</Button>
		</Flex>
	);
};
