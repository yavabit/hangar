import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Form, Input, Modal, Space, Switch, Typography } from "antd";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import { Link2 } from "lucide-react";
import { ProjectPathInput } from "@renderer/shared/components/ProjectPathInput/ProjectPathInput";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { useAppStore } from "@renderer/store/app.store";
import { FolderSelect } from "@renderer/shared/components/FolderSelect/FolderSelect";
import { submitOnEnter } from "@renderer/shared/utils/submitOnEnter";
import { resolveTaskTrackerUrl } from "@common/utils/folderTree";
import type { PathInfo } from "@common/api/api.types";
import type { Folder, Project } from "@schemas/store.schema";

import "./ProjectModal.scss";

type ProjectFormValues = {
	name: string;
	description?: string;
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
	const defaultTrackerUrl = useAppStore((s) => s.settings.common.taskTrackerUrl);

	const [form] = Form.useForm<ProjectFormValues>();
	const selectedFolderId = Form.useWatch("folderId", form);
	const taskTrackerUrl = resolveTaskTrackerUrl(folders, selectedFolderId, defaultTrackerUrl);
	const [saving, setSaving] = useState(false);
	const [pathInfo, setPathInfo] = useState<PathInfo | null>(null);

	const isEdit = !!project;

	/** Название и ссылку на git подставляем сами, пока пользователь не ввёл их вручную */
	const nameTouchedRef = useRef(isEdit);
	const gitTouchedRef = useRef(isEdit);

	useEffect(() => {
		if (isOpen) {
			nameTouchedRef.current = isEdit;
			gitTouchedRef.current = isEdit;
		}
	}, [isOpen, isEdit]);

	const initialValues: Partial<ProjectFormValues> = project
		? {
			name: project.name,
			description: project.description,
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
			if (info?.gitUrl && !gitTouchedRef.current && !form.getFieldValue("gitUrl")) {
				form.setFieldValue("gitUrl", info.gitUrl);
			}
		},
		[form],
	);

	const handleValuesChange = (changed: Partial<ProjectFormValues>): void => {
		if ("name" in changed) {
			nameTouchedRef.current = true;
		}
		if ("gitUrl" in changed) {
			gitTouchedRef.current = true;
		}
		if ("path" in changed && !nameTouchedRef.current) {
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
			description: values.description?.trim() || undefined,
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
				onKeyDown={submitOnEnter(() => void handleOk())}
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
				<Form.Item
					label="Описание"
					name="description"
					tooltip="Видно на карточке, по нему работает поиск: например, «бэкенд магазина, оплата и доставка»"
				>
					<Input.TextArea
						placeholder="Необязательно: что это за проект"
						autoSize={{ minRows: 1, maxRows: 4 }}
						maxLength={300}
						allowClear
					/>
				</Form.Item>
				<Form.Item label="Папка" name="folderId">
					<FolderSelect />
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
					tooltip="Необязательно. Допишите номер задачи или путь к доске — ссылка появится на карточке проекта. Адрес трекера берётся у папки проекта или из настроек"
				>
					{taskTrackerUrl ? (
						<Space.Compact block>
							<Space.Addon className="project-modal__tracker-base">
								<Tooltip title={taskTrackerUrl}>
									<span><Link2 size={13} style={{ verticalAlign: -2 }} /> {taskTrackerUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}/</span>
								</Tooltip>
							</Space.Addon>
							<Form.Item name="taskPath" noStyle>
								<Input placeholder="PROJ-123" allowClear />
							</Form.Item>
						</Space.Compact>
					) : (
						<Typography.Text type="secondary">
							Укажите адрес таск-трекера в настройках или у папки, чтобы привязывать задачи к проектам
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
