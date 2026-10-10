import { SelectFolder } from "@renderer/shared/components/SelectFolder/SelectFolder";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { useAppStore } from "@renderer/store/app.store";
import { Project } from "@schemas/store.schema";
import { Form, Input, Modal, Select, Switch } from "antd";
import { FC } from "react";

type AddProjectModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export const AddOrEditProjectModal: FC<AddProjectModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { addProject } = useProjects();
	const { selectedFolder, folders } = useAppStore((s) => s);

	const [form] = Form.useForm<Project>();

	const handleOk: (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) => void = () => {

		form.validateFields()
			.then((values) => {
				console.log(values);
				addProject(values);
				onClose?.();
			})
			.catch((errorInfo) => {
				console.log('Ошибка валидации:', errorInfo);
				form.scrollToField(errorInfo.errorFields[0].name);
			});
	};

	const handleCancel: (
		e:
			| React.KeyboardEvent<HTMLElement>
			| React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) => void = () => {
		onClose?.();
	};

	return (
		<Modal
			title="+ Новый проект"
			closable={{ "aria-label": "Custom Close Button" }}
			open={isOpen}
			onOk={handleOk}
			onCancel={handleCancel}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					label="Название проекта"
					name="name"
					rules={[{ required: true, message: "Введите название проекта" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Папка"
					name="folderId"
					initialValue={selectedFolder?.id}
				>
					<Select
						options={
							selectedFolder
								? [{ label: selectedFolder.name, value: selectedFolder.id }]
								: folders.map((f) => ({ label: f.name, value: f.id }))
						}
						disabled={!!selectedFolder}
						defaultValue={selectedFolder?.id}
						allowClear
					/>
				</Form.Item>
				<Form.Item
					label="Путь"
					name="path"
					rules={[{ required: true, message: "Выберите папку" }]}
				>
					<SelectFolder onSelect={(path) => form.setFieldValue("path", path)} />
				</Form.Item>

				<Form.Item
					name="isFavorite"
					colon={false}
					labelAlign="right"
					initialValue={false}
				>
					<Switch />
					<span style={{ marginLeft: '8px' }}>Добавить в избранное</span>
				</Form.Item>
				{/* <Form.Item
					label="Git URL"
					name="git"
					rules={[{ required: true, message: "Please input your username!" }]}
				>
					<Input />
				</Form.Item> */}
			</Form>
		</Modal>
	);
};
