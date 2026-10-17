import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Form, Input, Modal, Select, Space, Switch, Tooltip, Typography } from "antd";
import { FolderOutlined, LinkOutlined } from "@ant-design/icons";
import { ProjectPathInput } from "@renderer/shared/components/ProjectPathInput/ProjectPathInput";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { useAppStore } from "@renderer/store/app.store";
import type { PathInfo } from "@common/api/api.types";
import type { Folder, Project } from "@schemas/store.schema";

import "./ProjectModal.scss";

type ProjectFormValues = {
	name: string;
	path: string;
	folderId?: Folder["id"];
	gitUrl?: string;
	taskPath?: string;
	isFavorite: boolean;
};

type ProjectModalProps = {
	isOpen: boolean;
	onClose: () => void;
	project?: Project;
	defaults?: Partial<ProjectFormValues>;
};

const getFolderName = (path: string): string => path.split(/[\\/]+/).filter(Boolean).pop() ?? "";

export const ProjectModal: FC<ProjectModalProps> = ({ isOpen, onClose, project, defaults }) => {
	const { addProject, updateProject } = useProjects();
	const { resolvePath } = usePathAliases();
	const folders = useAppStore((s) => s.folders);
	const taskTrackerUrl = useAppStore((s) => s.settings.common.taskTrackerUrl.trim());

	const [form] = Form.useForm<ProjectFormValues>();
	const [saving, setSaving] = useState(false);
	const [pathInfo, setPathInfo] = useState<PathInfo | null>(null);

	const isEdit = !!project;

	/** Название и ссылку на git подставляем сами, пока пользователь не ввёл их вручную */
	const nameTouched = useRef(isEdit);
	const gitTouched = useRef(isEdit);

	useEffect(() => {
		if (isOpen) {
			nameTouched.current = isEdit;
			gitTouched.current = isEdit;
		}
	}, [isOpen, isEdit]);

	const initialValues: Partial<ProjectFormValues> = project
		? {
			name: project.name,
			path: project.path,
			folderId: folders.some((f) => f.id === project.folderId) ? project.folderId : undefined,
			gitUrl: project.gitUrl,
			taskPath: project.taskPath,
			isFavorite: project.isFavorite,
		}
		: { isFavorite: false, ...defaults };

	const handlePathInfo = useCallback(
		(info: PathInfo | null) => {
			setPathInfo(info);
			if (info?.gitUrl && !gitTouched.current && !form.getFieldValue("gitUrl")) {
				form.setFieldValue("gitUrl", info.gitUrl);
			}
		},
		[form],
	);

	const handleValuesChange = (changed: Partial<ProjectFormValues>): void => {
		if ("name" in changed) {
			nameTouched.current = true;
		}
		if ("gitUrl" in changed) {
			gitTouched.current = true;
		}
		if ("path" in changed && !nameTouched.current) {
			form.setFieldValue("name", getFolderName(resolvePath(changed.path ?? "")));
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
			path: values.path.trim(),
			folderId: values.folderId,
			gitUrl: values.gitUrl?.trim() || undefined,
			taskPath: values.taskPath?.trim() || undefined,
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

	const pathMissing = !isEdit && !pathInfo?.exists;

	return (
		<Modal
			title={isEdit ? "Редактирование проекта" : "Новый проект"}
			open={isOpen}
			onOk={handleOk}
			onCancel={onClose}
			okText={isEdit ? "Сохранить" : "Добавить"}
			okButtonProps={{ disabled: pathMissing }}
			cancelText="Отмена"
			confirmLoading={saving}
			width={600}
			destroyOnHidden
			afterOpenChange={(open) => {
				if (!open) {
					setPathInfo(null);
				}
			}}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={initialValues}
				preserve={false}
				onValuesChange={handleValuesChange}
			>
				<Form.Item
					label="Путь"
					name="path"
					tooltip="Выберите алиас из настроек и допишите путь внутри него — тогда при смене пути алиаса проект «переедет» вместе с ним"
					rules={[{ required: true, whitespace: true, message: "Укажите папку проекта" }]}
				>
					<ProjectPathInput onInfo={handlePathInfo} />
				</Form.Item>
				<Form.Item
					label="Название проекта"
					name="name"
					rules={[{ required: true, whitespace: true, message: "Введите название проекта" }]}
				>
					<Input placeholder="Подставится из имени папки" />
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
				<Form.Item
					label="Таск-трекер"
					tooltip="Необязательно. Допишите номер задачи или путь к доске — ссылка появится на карточке проекта"
				>
					{taskTrackerUrl ? (
						<Space.Compact block>
							<Space.Addon className="project-modal__tracker-base">
								<Tooltip title={taskTrackerUrl}>
									<LinkOutlined /> {taskTrackerUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}/
								</Tooltip>
							</Space.Addon>
							<Form.Item name="taskPath" noStyle>
								<Input placeholder="PROJ-123" allowClear />
							</Form.Item>
						</Space.Compact>
					) : (
						<Typography.Text type="secondary">
							Укажите адрес таск-трекера в настройках, чтобы привязывать задачи к проектам
						</Typography.Text>
					)}
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
