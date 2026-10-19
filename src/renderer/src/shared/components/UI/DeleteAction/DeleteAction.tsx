import { FC } from "react";
import { Popconfirm } from "antd";
import { LazyTooltip } from "@renderer/shared/components/UI/LazyTooltip/LazyTooltip";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

export type DeleteConfirm = {
	title: ReactNode;
	description: ReactNode;
	onConfirm: () => void;
	onOpenChange?: (open: boolean) => void;
};

/** Кнопка удаления с подтверждением для панели действий */
export const DeleteAction: FC<DeleteConfirm> = ({ title, description, onConfirm, onOpenChange }) => (
	<Popconfirm
		title={title}
		description={description}
		onConfirm={onConfirm}
		onOpenChange={onOpenChange}
		okText="Удалить"
		okButtonProps={{ danger: true }}
		cancelText="Отмена"
	>
		<span style={{ display: "inline-flex" }}>
			<LazyTooltip title="Удалить">
				<button type="button" aria-label="Удалить" className="card-action card-action--danger">
					<Trash2 size={15} strokeWidth={1.9} />
				</button>
			</LazyTooltip>
		</span>
	</Popconfirm>
);
