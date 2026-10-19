import { FC, ReactNode, useMemo } from "react";
import { TreeSelect } from "antd";
import { ChevronDown, Folder as FolderIcon, FolderOpen } from "lucide-react";
import type { Folder } from "@schemas/store.schema";
import { useFolderTree } from "@renderer/shared/hooks/useFolderTree";

import "./FolderSelect.scss";

type FolderNode = {
	value: string;
	title: ReactNode;
	/** Полный путь — показывается в поле после выбора и используется в поиске */
	path: string;
	disabled?: boolean;
	children?: FolderNode[];
};

type FolderSelectProps = {
	value?: Folder["id"];
	onChange?: (value: Folder["id"] | undefined) => void;
	placeholder?: string;
	/** Почему папку нельзя выбрать: текст показывается рядом с названием. null — можно */
	disabledReason?: (folder: Folder) => string | null;
};

/** Выбор папки деревом: с иконками, полным путём в поле и пояснением у недоступных вариантов */
export const FolderSelect: FC<FolderSelectProps> = ({ value, onChange, placeholder = "Без папки", disabledReason }) => {
	const tree = useFolderTree();

	const treeData = useMemo(() => {
		const build = (parentId: string | undefined, seen: Set<string>): FolderNode[] =>
			tree.childrenOf(parentId)
				.filter((folder) => !seen.has(folder.id))
				.map((folder) => {
					const reason = disabledReason?.(folder) ?? null;
					const children = build(folder.id, new Set([...seen, folder.id]));

					return {
						value: folder.id,
						path: tree.pathLabel(folder.id),
						disabled: !!reason,
						title: (
							<span className="folder-select__node">
								<FolderIcon size={14} strokeWidth={1.9} />
								<span className="folder-select__name">{folder.name}</span>
								{reason && <span className="folder-select__reason">{reason}</span>}
							</span>
						),
						children: children.length ? children : undefined,
					};
				});

		return build(undefined, new Set());
	}, [tree, disabledReason]);

	return (
		<TreeSelect<Folder["id"] | undefined>
			value={value}
			onChange={(next) => onChange?.(next || undefined)}
			treeData={treeData}
			treeNodeLabelProp="path"
			treeNodeFilterProp="path"
			showSearch
			allowClear
			treeDefaultExpandAll
			placeholder={placeholder}
			prefix={<FolderOpen size={15} strokeWidth={1.9} className="folder-select__prefix" />}
			switcherIcon={<ChevronDown size={14} strokeWidth={2} />}
			notFoundContent={tree.folders.length ? "Ничего не найдено" : "Папок пока нет"}
			classNames={{ popup: { root: "folder-select-popup" } }}
		/>
	);
};
