import { FC, useEffect, useState } from "react";
import { Button, Input, Select, Space, Typography } from "antd";
import { CircleCheck, FolderOpen, TriangleAlert } from "lucide-react";
import { buildAliasPath, findAlias, parseAliasPath, toAliasPath } from "@common/utils/pathAliases";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { api } from "@renderer/shared/api";
import type { PathInfo } from "@common/api/api.types";

const FULL_PATH = "__full__";
const CHECK_DELAY_MS = 300;

type ProjectPathInputProps = {
	/** Значение от Form.Item: полный путь или "@alias/rest" */
	value?: string;
	onChange?: (value: string) => void;
	/** Результат проверки пути: null, пока проверка идёт или путь пуст */
	onInfo?: (info: PathInfo | null) => void;
};

/**
 * Путь проекта: алиас из настроек + относительная часть, либо полный путь.
 */
export const ProjectPathInput: FC<ProjectPathInputProps> = ({ value = "", onChange, onInfo }) => {
	const { aliases, resolvePath } = usePathAliases();
	const [info, setInfo] = useState<PathInfo | null>(null);

	const parsed = parseAliasPath(value);
	const aliasName = parsed?.alias ?? FULL_PATH;
	const text = parsed ? parsed.rest : value;
	const suggestion = parsed ? null : toAliasPath(value, aliases);
	const usableAliases = aliases.filter((a) => a.path.trim() && a.alias.length > 1);

	useEffect(() => {
		onInfo?.(null);
		if (!value.trim()) {
			return;
		}

		let cancelled = false;
		const timer = setTimeout(() => {
			api.projects
				.inspectPath(value)
				.then((result) => {
					if (!cancelled) {
						setInfo(result);
						onInfo?.(result);
					}
				})
				.catch(() => !cancelled && setInfo(null));
		}, CHECK_DELAY_MS);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [value, onInfo]);

	const handleAliasChange = (next: string): void => {
		if (next === FULL_PATH) {
			onChange?.(resolvePath(value));
			return;
		}

		const alias = aliases.find((a) => a.alias === next);
		const aliased = alias && !parsed ? toAliasPath(value, [alias]) : null;
		onChange?.(aliased ?? buildAliasPath(next, parsed?.rest ?? ""));
	};

	const handleTextChange = (nextText: string): void => {
		onChange?.(parsed ? buildAliasPath(parsed.alias, nextText) : nextText);
	};

	/** Диалог открывается в текущей папке проекта, а если её нет — в папке выбранного алиаса */
	const getBrowseStartPath = (): string | undefined => {
		if (value.trim() && info?.exists && info.resolvedPath === resolvePath(value)) {
			return info.resolvedPath;
		}
		return parsed ? findAlias(aliases, parsed.alias)?.path : undefined;
	};

	const handleBrowse = async (): Promise<void> => {
		const folderPath = await api.fileSystem.selectFolder(getBrowseStartPath());
		if (!folderPath) {
			return;
		}

		onChange?.(toAliasPath(folderPath, aliases) ?? folderPath);
	};

	const showStatus = !!value.trim() && info;

	return (
		<div>
			<Space.Compact block>
				{usableAliases.length > 0 && (
					<Select
						value={aliasName}
						onChange={handleAliasChange}
						style={{ width: 150 }}
						popupMatchSelectWidth={false}
						options={[
							{ value: FULL_PATH, label: "Полный путь" },
							...usableAliases.map((alias) => ({
								value: alias.alias,
								label: (
									<span>
										<span style={{ color: alias.color, fontWeight: 600 }}>{alias.alias}</span>
										<Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
											{alias.path}
										</Typography.Text>
									</span>
								),
							})),
						]}
						labelRender={({ value: selected }) =>
							selected === FULL_PATH ? "Полный путь" : <span style={{ fontWeight: 600 }}>{selected}</span>
						}
					/>
				)}
				<Input
					value={text}
					onChange={(e) => handleTextChange(e.target.value)}
					placeholder={parsed ? "папка/внутри/алиаса" : "C:\\Projects\\my-app"}
					prefix={parsed ? <Typography.Text type="secondary">/</Typography.Text> : undefined}
					style={{ fontFamily: "monospace" }}
				/>
				<Button icon={<FolderOpen size={15} />} onClick={handleBrowse}>
					Обзор
				</Button>
			</Space.Compact>

			{showStatus && (
				<div style={{ marginTop: 6, fontSize: 12 }}>
					{info.exists ? (
						<Typography.Text type="secondary" style={{ fontSize: 12 }}>
							<CircleCheck size={13} style={{ color: "var(--success)", marginRight: 6, verticalAlign: -2 }} />
							<span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{info.resolvedPath}</span>
						</Typography.Text>
					) : (
						<Typography.Text type="warning" style={{ fontSize: 12 }}>
							<TriangleAlert size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
							Папка не найдена:{" "}
							<span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{info.resolvedPath}</span>
						</Typography.Text>
					)}
				</div>
			)}

			{suggestion && (
				<div style={{ marginTop: 4, fontSize: 12 }}>
					<Typography.Text type="secondary" style={{ fontSize: 12 }}>
						Путь внутри алиаса:{" "}
					</Typography.Text>
					<Typography.Link style={{ fontSize: 12 }} onClick={() => onChange?.(suggestion)}>
						использовать {suggestion}
					</Typography.Link>
				</div>
			)}
		</div>
	);
};
