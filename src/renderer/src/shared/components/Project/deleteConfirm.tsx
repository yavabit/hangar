import type { Project } from "@schemas/store.schema";
import type { DeleteConfirm } from "@renderer/shared/components/UI/DeleteAction/DeleteAction";

/** Подтверждение удаления проекта: файлы на диске не трогаются */
export const getProjectDeleteConfirm = (item: Project, onConfirm: () => void): DeleteConfirm => ({
	title: "Удаление проекта",
	description: (
		<span>
			Убрать «{item.name}» из Hangar?
			<br />
			Файлы на диске останутся.
		</span>
	),
	onConfirm,
});
