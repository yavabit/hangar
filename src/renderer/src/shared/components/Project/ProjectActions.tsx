import { FC } from "react";
import { Code, FolderOpen, Pencil } from "lucide-react";
import type { ProjectHealth } from "@common/api/api.types";
import type { Project } from "@schemas/store.schema";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";
import { GitStatus } from "@renderer/shared/components/UI/GitStatus/GitStatus";
import { useProjects } from "@renderer/shared/hooks/useProjects";

const MISSING_HINT = "Папка не найдена. Исправьте путь в настройках проекта";

type ProjectActionsProps = {
	project: Project;
	health?: ProjectHealth;
	onEdit: () => void;
};

/** Действия проекта: IDE, репозиторий, проводник, редактирование. Удаление добавляет обёртка */
export const ProjectActions: FC<ProjectActionsProps> = ({ project, health, onEdit }) => {
	const { openProjectInIde, openProjectFolder } = useProjects();
	const missing = health?.exists === false;

	return (
		<>
			<CardAction
				title={missing ? MISSING_HINT : "Открыть в IDE (или двойной клик)"}
				icon={<Code size={15} strokeWidth={2} />}
				label="Открыть"
				variant="primary"
				disabled={missing}
				onClick={() => void openProjectInIde(project.id)}
			/>
			<GitStatus gitUrl={project.gitUrl} git={missing ? null : health?.git} />
			<CardAction
				title={missing ? MISSING_HINT : "Открыть в проводнике"}
				icon={<FolderOpen size={15} strokeWidth={1.9} />}
				disabled={missing}
				onClick={() => void openProjectFolder(project.id)}
			/>
			<CardAction title="Редактировать" icon={<Pencil size={15} strokeWidth={1.9} />} onClick={onEdit} />
		</>
	);
};
