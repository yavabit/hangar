import React, { useMemo, useState } from "react";
import { Button, Card, Flex, Typography, Input, Tooltip, ColorPicker } from "antd";
import {
	PlusOutlined,
	TagOutlined,
	DeleteOutlined,
	SwapOutlined,
} from "@ant-design/icons";
import { type PathAliasSchemaType } from "@schemas/store.schema";
import { AggregationColor } from "antd/es/color-picker/color";
import { SelectFolder } from "@renderer/shared/components/SelectFolder/SelectFolder";
import { useAppStore } from "@renderer/store/app.store";
import { useAppNotification } from "@renderer/shared/hooks/useAppNotification";
import { projectsApi } from "@renderer/shared/api/projects.api";
import { getIpcErrorMessage } from "@renderer/shared/utils/ipcError";
import { pluralize } from "@renderer/shared/utils/pluralize";
import { toAliasPath } from "@common/utils/pathAliases";

const { Text } = Typography;

interface PathAliasesManagerProps {
	value?: PathAliasSchemaType[];
	onChange?: (value: PathAliasSchemaType[]) => void;
}

const cleanAliasName = (raw: string): string => {
	let cleaned = raw.replace(/[^a-zA-Z0-9@_-]/g, "").replace(/(?!^)@/g, "");
	if (cleaned && !cleaned.startsWith("@")) {
		cleaned = "@" + cleaned;
	}
	return cleaned || "@";
};

export const PathAliasesManager: React.FC<PathAliasesManagerProps> = ({
	value = [],
	onChange,
}) => {
	const savedAliases = useAppStore((s) => s.settings.common.pathAliases);
	const projects = useAppStore((s) => s.projects);
	const { showSuccess, showError } = useAppNotification();
	const [addedId, setAddedId] = useState<string | null>(null);

	const updateItem = (id: string, patch: Partial<PathAliasSchemaType>): void => {
		onChange?.(value.map((item) => (item.id === id ? { ...item, ...patch } : item)));
	};

	const handleAdd = (): void => {
		const id = crypto.randomUUID();
		setAddedId(id);
		onChange?.([...value, { alias: "@", path: "", color: "#1677ff", id }]);
	};

	const handleRemove = (id: string): void => {
		onChange?.(value.filter((item) => item.id !== id));
	};

	const handleColorChange = (id: string, color: AggregationColor): void => {
		updateItem(id, { color: color.toHexString() });
	};

	/** Сколько проектов указаны полным путём внутри папки алиаса */
	const absoluteCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const item of value) {
			counts.set(item.id, projects.filter((p) => toAliasPath(p.path, [item])).length);
		}
		return counts;
	}, [value, projects]);

	const isSaved = (item: PathAliasSchemaType): boolean =>
		!!savedAliases?.some((saved) => saved.id === item.id && saved.alias === item.alias && saved.path === item.path);

	const handleApply = async (item: PathAliasSchemaType): Promise<void> => {
		try {
			const count = await projectsApi.applyAlias(item.id);
			showSuccess("alias_apply", {
				message: `${count} ${pluralize(count, ["проект переведён", "проекта переведены", "проектов переведено"])} на ${item.alias}`,
			});
		} catch (e) {
			showError("alias_apply", { message: "Не удалось применить алиас", description: getIpcErrorMessage(e) });
		}
	};

	return (
		<Flex vertical gap={12}>
			{value.length === 0 && (
				<Card
					size="small"
					style={{ textAlign: "center", background: "#fafafa" }}
				>
					<Text type="secondary">
						Нет добавленных алиасов. Нажмите «Добавить алиас»
					</Text>
				</Card>
			)}

			{value.map((item) => {
				const absoluteCount = absoluteCounts.get(item.id) ?? 0;

				return (
					<Card
						key={item.id}
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
										onChange={(e) => updateItem(item.id, { alias: cleanAliasName(e.target.value) })}
										prefix={<TagOutlined style={{ color: "#bfbfbf" }} />}
										size="middle"
										autoFocus={item.id === addedId}
									/>
								</div>

								<div style={{ flex: 2, minWidth: 250 }}>
									<SelectFolder
										onSelect={(path) => updateItem(item.id, { path })}
										value={item.path}
									/>
								</div>

								<Tooltip title="Сменить цвет">
									<ColorPicker
										value={item.color}
										onChangeComplete={(color) => handleColorChange(item.id, color)}
									/>
								</Tooltip>

								<Tooltip title="Удалить. Пути проектов с этим алиасом станут полными">
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

							{absoluteCount > 0 && (
								<Flex align="center" gap={8} wrap="wrap" style={{ fontSize: 12 }}>
									<Text type="secondary" style={{ fontSize: 12 }}>
										{absoluteCount} {pluralize(absoluteCount, ["проект лежит", "проекта лежат", "проектов лежат"])} в этой папке, но указаны полным путём.
									</Text>
									{isSaved(item) ? (
										<Button size="small" icon={<SwapOutlined />} onClick={() => void handleApply(item)}>
											Перевести на {item.alias}
										</Button>
									) : (
										<Text type="warning" style={{ fontSize: 12 }}>
											Сохраните настройки, чтобы перевести их на алиас
										</Text>
									)}
								</Flex>
							)}
						</Flex>
					</Card>
				);
			})}

			<Button type="dashed" onClick={handleAdd} icon={<PlusOutlined />} block>
				Добавить алиас
			</Button>
		</Flex>
	);
};
