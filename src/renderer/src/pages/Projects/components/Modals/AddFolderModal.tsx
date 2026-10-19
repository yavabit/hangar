import { Folder } from "@schemas/store.schema";
import { Form, Input, Modal, TreeSelect } from "antd";
import { FC } from "react";
import { useAppStore } from "@renderer/store/app.store";
import { MAX_FOLDER_DEPTH, useFolderTree } from "@renderer/shared/hooks/useFolderTree";

export type FolderFormValues = Pick<Folder, "name" | "description" | "parentId" | "taskTrackerUrl">;

type AddOrEditFolderModalProps = {
	isOpen: boolean;
	editModalData?: Folder;
	/** Родитель новой папки по умолчанию — например, папка, со страницы которой её создают */
	defaultParentId?: Folder["id"];
	onFinish: (folder: FolderFormValues, id?: Folder["id"]) => void;
	onClose: () => void;
};

export const AddOrEditFolderModal: FC<AddOrEditFolderModalProps> = ({ isOpen, editModalData, defaultParentId, onClose, onFinish }) => {
	const [form] = Form.useForm<FolderFormValues>();
	const tree = useFolderTree();
	const defaultTrackerUrl = useAppStore((s) => s.settings.common.taskTrackerUrl);
	const parentId = Form.useWatch("parentId", form);

	const isEdit = !!editModalData;
	const trackerSource = tree
		.pathOf(parentId)
		.reverse()
		.find((folder) => folder.taskTrackerUrl?.trim());
	const trackerPlaceholder = trackerSource
		? `Как у папки «${trackerSource.name}»: ${trackerSource.taskTrackerUrl}`
		: defaultTrackerUrl.trim()
			? `Как в настройках: ${defaultTrackerUrl.trim()}`
			: "Не задан — ни в настройках, ни у родительских папок";

	const treeData = tree.toTreeData((folder) =>
		isEdit ? !tree.canMove(editModalData.id, folder.id) : !tree.canCreateIn(folder.id),
	);

	const handleOk = async (): Promise<void> => {
		let values: FolderFormValues;
		try {
			values = await form.validateFields();
		} catch {
			return;
		}

		onFinish(
			{
				name: values.name.trim(),
				description: values.description?.trim() || undefined,
				parentId: values.parentId || undefined,
				taskTrackerUrl: values.taskTrackerUrl?.trim() || undefined,
			},
			editModalData?.id,
		);
		onClose();
	};

	return (
		<Modal
			title={isEdit ? "Редактирование папки" : "Новая папка"}
			open={isOpen}
			onOk={handleOk}
			onCancel={onClose}
			okText={isEdit ? "Сохранить" : "Создать"}
			cancelText="Отмена"
			destroyOnHidden
		>
			<Form
				form={form}
				layout="vertical"
				preserve={false}
				initialValues={
					editModalData
						? {
							name: editModalData.name,
							description: editModalData.description,
							parentId: editModalData.parentId,
							taskTrackerUrl: editModalData.taskTrackerUrl,
						}
						: { parentId: defaultParentId }
				}
			>
				<Form.Item
					label="Название"
					name="name"
					rules={[{ required: true, whitespace: true, message: "Введите название папки" }]}
				>
					<Input placeholder="Например: Заказчик 1" autoFocus />
				</Form.Item>
				<Form.Item
					label="Внутри папки"
					name="parentId"
					tooltip={`Папки вкладываются не глубже ${MAX_FOLDER_DEPTH} уровней. Недоступные варианты отмечены серым`}
				>
					<TreeSelect
						allowClear
						treeDefaultExpandAll
						placeholder="На верхнем уровне"
						treeData={treeData}
						notFoundContent="Папок пока нет"
					/>
				</Form.Item>
				<Form.Item
					label="Таск-трекер"
					name="taskTrackerUrl"
					tooltip="Свой адрес трекера для проектов этой папки и вложенных. Если не указан — берётся у родительской папки или из настроек"
					rules={[{ type: "url", message: "Введите адрес, например https://jira.client.com/browse" }]}
				>
					<Input placeholder={trackerPlaceholder} allowClear />
				</Form.Item>
				<Form.Item
					label="Описание"
					name="description"
				>
					<Input.TextArea maxLength={100} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
				</Form.Item>
			</Form>
		</Modal>
	);
};
