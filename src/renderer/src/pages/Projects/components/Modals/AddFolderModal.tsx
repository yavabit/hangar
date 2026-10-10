import { Folder } from "@schemas/store.schema";
import { Form, Input, Modal } from "antd";
import { FC, useEffect } from "react";

type AddOrEditFolderModalProps = {
	isOpen: boolean;
	editModalData?: Folder;
	onFinish: (folder: Folder, id?: Folder['id']) => void;
	onClose: () => void;
};

export const AddOrEditFolderModal: FC<AddOrEditFolderModalProps> = ({ isOpen, editModalData, onClose, onFinish }) => {
	const [form] = Form.useForm<Folder>()

	const handleOk: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) = () => {
		const fields = form.getFieldsValue();
		onFinish?.(fields, editModalData?.id);
		form.resetFields();
		onClose?.();
	};

	const handleCancel: ((e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) = () => {
		form.resetFields();
		onClose?.();
	};

	useEffect(() => {
		if (editModalData) {
			form.setFieldsValue(editModalData)
		}
	}, [editModalData, form, isOpen])

	return (
		<Modal
			title="Новая папка"
			closable={{ "aria-label": "Custom Close Button" }}
			open={isOpen}
			onOk={handleOk}
			onCancel={handleCancel}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					label="Название"
					name="name"
					rules={[{ required: true, message: "Please input your username!" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Описание"
					name="description"
				>
					<Input.TextArea maxLength={100}/>					
				</Form.Item>
			</Form>
		</Modal>
	);
};
