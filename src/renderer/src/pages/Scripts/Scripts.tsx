import { FC } from "react";
import { Empty } from "antd";
import { CodeOutlined } from "@ant-design/icons";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";

export const Scripts: FC = () => {
	return (
		<div>
			<PageHeader icon={<CodeOutlined />} title="Скрипты" description="Быстрый запуск команд для проектов" />
			<Empty description="Раздел в разработке" style={{ padding: "48px 0" }} />
		</div>
	);
};
