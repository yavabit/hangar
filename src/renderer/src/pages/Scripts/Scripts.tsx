import { FC } from "react";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";
import { EmptyState } from "@renderer/shared/components/EmptyState/EmptyState";

export const Scripts: FC = () => {
	return (
		<div>
			<PageHeader title="Скрипты" description="Быстрый запуск команд для проектов" />
			<div className="glass" style={{ borderRadius: "var(--radius-xl)" }}>
				<EmptyState title="Раздел в разработке" description="Здесь появятся команды проектов: сборка, тесты, запуск dev-сервера — в консоли из настроек." />
			</div>
		</div>
	);
};
