import { FC, useState } from "react";
import { Button, Tooltip } from "antd";
import { SyncOutlined } from "@ant-design/icons";
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
		<Tooltip title="Обновить статусы git, наличие папок и даты изменений. Само обновляется при возврате в окно, но не чаще раза в 5 минут">
			<Button icon={<SyncOutlined spin={loading} />} onClick={handleClick} disabled={loading} aria-label="Обновить статусы" />
		</Tooltip>
	);
};
