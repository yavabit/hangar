import { FC } from "react";
import { Typography } from "antd";
import { LazyTooltip } from "@renderer/shared/components/UI/LazyTooltip/LazyTooltip";
import { findAlias, parseAliasPath } from "@common/utils/pathAliases";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";

import "./ProjectPath.scss";

type ProjectPathProps = {
	path: string;
	missing?: boolean;
};

/**
 * Путь проекта: алиас показывается цветной меткой, полный путь — в подсказке.
 */
export const ProjectPath: FC<ProjectPathProps> = ({ path, missing = false }) => {
	const { aliases, resolvePath } = usePathAliases();

	const parsed = parseAliasPath(path);
	const alias = parsed ? findAlias(aliases, parsed.alias) : undefined;
	const fullPath = resolvePath(path);

	const tooltip = (
		<div>
			{missing && <div style={{ fontWeight: 600 }}>Папка не найдена</div>}
			{parsed && !alias && <div style={{ fontWeight: 600 }}>Алиас {parsed.alias} не найден в настройках</div>}
			<div style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{fullPath}</div>
		</div>
	);

	return (
		<LazyTooltip title={tooltip} placement="topLeft">
			<span className={`project-path ${missing ? "project-path--missing" : ""}`}>
				{parsed ? (
					<>
						<span
							className="project-path__alias"
							style={alias ? { borderColor: alias.color, color: alias.color } : undefined}
						>
							{parsed.alias}
						</span>
						{parsed.rest && (
							<Typography.Text className="project-path__rest" type={missing ? "danger" : undefined}>
								/{parsed.rest}
							</Typography.Text>
						)}
					</>
				) : (
					<Typography.Text className="project-path__rest" type={missing ? "danger" : undefined}>
						{path}
					</Typography.Text>
				)}
			</span>
		</LazyTooltip>
	);
};
