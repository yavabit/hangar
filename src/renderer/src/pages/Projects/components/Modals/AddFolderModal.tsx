import { Folder } from "@schemas/store.schema";
import { Form, Input, Modal } from "antd";
import { FC } from "react";

type FolderFormValues = Pick<Folder, "name" | "description">;

type AddOrEditFolderModalProps = {
	isOpen: boolean;
	editModalData?: Folder;
	onFinish: (folder: FolderFormValues, id?: Folder['id']) => void;
	onClose: () => void;
};

export const AddOrEditFolderModal: FC<AddOrEditFolderModalProps> = ({ isOpen, editModalData, onClose, onFinish }) => {
	const [form] = Form.useForm<FolderFormValues>()

	const isEdit = !!editModalData;

	const handleOk = async (): Promise<void> => {
		let values: FolderFormValues;
		try {
			values = await form.validateFields();
		} catch {
			return;
		}

		onFinish({ name: values.name.trim(), description: values.description?.trim() || undefined }, editModalData?.id);
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
				initialValues={editModalData ? { name: editModalData.name, description: editModalData.description } : undefined}
			>
				<Form.Item
					label="Название"
					name="name"
					rules={[{ required: true, whitespace: true, message: "Введите название папки" }]}
				>
					<Input placeholder="Например: Работа" autoFocus />
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
