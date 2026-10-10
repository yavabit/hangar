import { FC, useState } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import { SelectFolder } from "@renderer/shared/components/SelectFolder/SelectFolder";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { useAppStore } from "@renderer/store/app.store";
import { projectsApi } from "@renderer/shared/api/projects.api";
import type { Folder, Project } from "@schemas/store.schema";

type ProjectFormValues = {
	name: string;
	path: string;
	folderId?: Folder["id"];
	gitUrl?: string;
	isFavorite: boolean;
};

type ProjectModalProps = {
	isOpen: boolean;
	onClose: () => void;
	project?: Project;
	defaults?: Partial<ProjectFormValues>;
};

export const ProjectModal: FC<ProjectModalProps> = ({ isOpen, onClose, project, defaults }) => {
	const { addProject, updateProject } = useProjects();
	const folders = useAppStore((s) => s.folders);

	const [form] = Form.useForm<ProjectFormValues>();
	const [saving, setSaving] = useState(false);

	const isEdit = !!project;

	const initialValues: Partial<ProjectFormValues> = project
		? {
			name: project.name,
			path: project.path,
			folderId: folders.some((f) => f.id === project.folderId) ? project.folderId : undefined,
			gitUrl: project.gitUrl,
			isFavorite: project.isFavorite,
		}
		: { isFavorite: false, ...defaults };

	const handlePathSelect = async (path: string): Promise<void> => {
		try {
			const info = await projectsApi.inspectPath(path);

			if (!form.getFieldValue("name")) {
				form.setFieldValue("name", info.name);
			}

			if (info.gitUrl && !form.getFieldValue("gitUrl")) {
				form.setFieldValue("gitUrl", info.gitUrl);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleOk = async (): Promise<void> => {
		let values: ProjectFormValues;
		try {
			values = await form.validateFields();
		} catch {
			return;
		}

		const data = {
			name: values.name.trim(),
			path: values.path,
			folderId: values.folderId,
			gitUrl: values.gitUrl?.trim() || undefined,
			isFavorite: values.isFavorite,
		};

		setSaving(true);
		try {
			if (project) {
				await updateProject(project.id, data);
			} else {
				await addProject(data);
			}
			onClose();
		} catch (e) {
			console.log(e);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal
			title={isEdit ? "Редактирование проекта" : "Новый проект"}
			open={isOpen}
			onOk={handleOk}
			onCancel={onClose}
			okText={isEdit ? "Сохранить" : "Добавить"}
			cancelText="Отмена"
			confirmLoading={saving}
			destroyOnHidden
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={initialValues}
				preserve={false}
			>
				<Form.Item
					label="Путь"
					name="path"
					rules={[{ required: true, message: "Выберите папку проекта" }]}
				>
					<SelectFolder onSelect={handlePathSelect} />
				</Form.Item>
				<Form.Item
					label="Название проекта"
					name="name"
					rules={[{ required: true, whitespace: true, message: "Введите название проекта" }]}
				>
					<Input placeholder="Название подставится из имени папки" />
				</Form.Item>
				<Form.Item label="Папка" name="folderId">
					<Select
						placeholder="Без папки"
						options={folders.map((f) => ({
							label: (
								<span>
									<FolderOutlined style={{ marginRight: 8 }} />
									{f.name}
								</span>
							),
							value: f.id,
						}))}
						allowClear
					/>
				</Form.Item>
				<Form.Item
					label="Git репозиторий"
					name="gitUrl"
					tooltip="Определяется автоматически из .git/config, если он есть в папке проекта"
				>
					<Input placeholder="https://github.com/user/repo.git" allowClear />
				</Form.Item>
				<Form.Item noStyle>
					<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
						<Form.Item name="isFavorite" valuePropName="checked" noStyle>
							<Switch />
						</Form.Item>
						<span>В избранном</span>
					</span>
				</Form.Item>
			</Form>
		</Modal>
	);
};
