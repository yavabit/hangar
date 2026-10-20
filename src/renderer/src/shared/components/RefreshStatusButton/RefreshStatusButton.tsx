import { FC, useState } from "react";
import { Button } from "antd";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import { RefreshCw } from "lucide-react";
import { projectsApi } from "@renderer/shared/api/projects.api";

/** Принудительная проверка папок, git и дат изменения всех проектов */
export const RefreshStatusButton: FC = () => {
	const [loading, setLoading] = useState(false);

	const handleClick = async (): Promise<void> => {
		setLoading(true);
		try {
			await projectsApi.refreshStatus(true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Tooltip title="Обновить статусы git, наличие папок и даты изменений. Автоматическое обновление настраивается в настройках">
			<Button
				icon={<RefreshCw size={15} className={loading ? "spin" : undefined} />}
				onClick={handleClick}
				disabled={loading}
				aria-label="Обновить статусы"
			/>
		</Tooltip>
	);
};
