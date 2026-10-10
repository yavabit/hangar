import React from "react";
import { Button, Card, Flex, Typography, Input, Tooltip, ColorPicker } from "antd";
import {
	PlusOutlined,
	TagOutlined,
	DeleteOutlined
} from "@ant-design/icons";
import { type PathAliasSchemaType } from "@schemas/store.schema";
import { AggregationColor } from "antd/es/color-picker/color";
import { SelectFolder } from "@renderer/shared/components/SelectFolder/SelectFolder";

const { Text } = Typography;

interface PathAliasesManagerProps {
	value?: PathAliasSchemaType[];
	onChange?: (value: PathAliasSchemaType[]) => void;
}

export const PathAliasesManager: React.FC<PathAliasesManagerProps> = ({
	value = [],
	onChange,
}) => {

	const handleAdd = (): void => {
		const newAliases = [...value, { alias: "@", path: "", color: "#d9d9d9", id: crypto.randomUUID() }];
		onChange?.(newAliases);
	};

	const handleRemove = (id: string): void => {
		const newAliases = value.filter((item) => item.id !== id);
		onChange?.(newAliases);
	};

	const handleAliasChange = (index: number, newAlias: string): void => {
		const newAliases = [...value];
		let cleaned = newAlias.replace(/[^a-zA-Z0-9@_-]/g, "");
		if (cleaned && !cleaned.startsWith("@")) {
			cleaned = "@" + cleaned;
		}
		if (cleaned === "") {
			cleaned = "@";
		}
		newAliases[index].alias = cleaned;
		onChange?.(newAliases);
	};

	const handleSelectFolder = (index: number, path: string): void => {
		if (path) {
			const newAliases = [...value];
			newAliases[index].path = path;
			onChange?.(newAliases);
		}
	};

	const handleColorChange = (id: string, color: AggregationColor): void => {
		const newAliases = [...value].map((item) => (item.id === id ? {...item, color: color.toHexString()} : { ...item }));

		onChange?.(newAliases);
	};

	return (
		<Flex vertical gap={12}>
			{value.length === 0 && (
				<Card
					size="small"
					style={{ textAlign: "center", background: "#fafafa" }}
				>
					<Text type="secondary">
						Нет добавленных алиасов. Нажмите Добавить алиас
					</Text>
				</Card>
			)}

			{value.map((item, index) => (
				<Card
					key={index}
					size="small"
					styles={{ body: { padding: 12 } }}
					style={{
						borderLeft: `3px solid ${item.color}`,
					}}
				>
					<Flex vertical gap={12}>
						<Flex gap={12} align="center" wrap="wrap">
							<div style={{ flex: 1, minWidth: 140 }}>
								<Input
									placeholder="@myapp"
									value={item.alias}
									onChange={(e) => handleAliasChange(index, e.target.value)}
									prefix={<TagOutlined style={{ color: "#bfbfbf" }} />}
									size="middle"
								/>
							</div>

							<div style={{ flex: 2, minWidth: 250 }}>
								<SelectFolder
									onSelect={(path) => handleSelectFolder(index, path)}
									path={item.path}
								/>
							</div>

							<Tooltip title="Сменить цвет">
								<ColorPicker
									defaultValue={item.color}
									onChangeComplete={(color) => handleColorChange(item.id, color)}
								/>
							</Tooltip>

							<Tooltip title="Удалить">
								<Button
									type="text"
									danger
									icon={<DeleteOutlined />}
									onClick={() => handleRemove(item.id)}
								/>
							</Tooltip>
							
						</Flex>

						{item.alias && item.alias !== "@" && item.path && (
							<div style={{ fontSize: 12, color: "#999" }}>								
								<Text code type="secondary">
									{item.alias}
								</Text>
								<Text type="secondary">
									→
								</Text>
								<Text code type="secondary">
									{item.path}
								</Text>
							</div>
						)}
					</Flex>
				</Card>
			))}

			<Button type="dashed" onClick={handleAdd} icon={<PlusOutlined />} block>
				Добавить алиас
			</Button>
		</Flex>
	);
};
