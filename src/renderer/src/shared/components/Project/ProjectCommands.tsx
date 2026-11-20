import { FC, useEffect, useState } from "react";
import { Alert, Button, Empty, Form, Input, Modal, Space, Spin, Typography } from "antd";
import { Pencil, Play, Plus, Terminal, Trash2 } from "lucide-react";
import type { Project } from "@schemas/store.schema";
import type { ProjectCommandRef, ProjectNpmScript } from "@common/api/api.types";
import { projectsApi } from "@renderer/shared/api/projects.api";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { getIpcErrorMessage } from "@renderer/shared/utils/ipcError";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";

type CustomCommand = NonNullable<Project["commands"]>[number];

export const ProjectCommands: FC<{ project: Project; missing: boolean }> = ({ project, missing }) => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<CardAction title={missing ? "Папка проекта не найдена" : "Команды проекта"} icon={<Terminal size={15} />} disabled={missing} onClick={() => setOpen(true)} />
			{open && <ProjectCommandsDialog project={project} onClose={() => setOpen(false)} />}
		</>
	);
};

const ProjectCommandsDialog: FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
	const [loading, setLoading] = useState(true);
	const [running, setRunning] = useState<string | null>(null);
	const [scripts, setScripts] = useState<ProjectNpmScript[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [editor, setEditor] = useState<CustomCommand | "new" | null>(null);
	const [saving, setSaving] = useState(false);
	const [form] = Form.useForm<Pick<CustomCommand, "name" | "command">>();
	const { updateProject } = useProjects();

	useEffect(() => {
		let active = true;
		void projectsApi.getNpmScripts(project.id)
			.then((items) => { if (active) setScripts(items); })
			.catch((e: unknown) => { if (active) setError(getIpcErrorMessage(e)); })
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [project.id]);

	const run = async (ref: ProjectCommandRef): Promise<void> => {
		setRunning(`${ref.type}:${ref.id}`);
		setError(null);
		try {
			await projectsApi.runCommand(project.id, ref);
			onClose();
		} catch (e) {
			setError(getIpcErrorMessage(e));
		} finally {
			setRunning(null);
		}
	};

	const save = async (): Promise<void> => {
		let values: Pick<CustomCommand, "name" | "command">;
		try { values = await form.validateFields(); } catch { return; }
		const item = { id: editor && editor !== "new" ? editor.id : crypto.randomUUID(), name: values.name.trim(), command: values.command.trim() };
		const commands = editor && editor !== "new"
			? (project.commands ?? []).map((command) => command.id === item.id ? item : command)
			: [...(project.commands ?? []), item];
		setSaving(true);
		try { await updateProject(project.id, { commands }); setEditor(null); }
		catch { /* notification from useProjects */ }
		finally { setSaving(false); }
	};

	const remove = async (command: CustomCommand): Promise<void> => {
		try { await updateProject(project.id, { commands: (project.commands ?? []).filter((item) => item.id !== command.id) }); }
		catch { /* notification from useProjects */ }
	};

	return (
		<>
			<Modal title={`Команды · ${project.name}`} open onCancel={onClose} footer={null} width={620} destroyOnHidden>
				<Typography.Paragraph type="secondary">Команды запускаются в терминале из настроек, в папке проекта.</Typography.Paragraph>
				{error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
				<Spin spinning={loading}>
					<div className="project-commands">
						<div className="project-commands__header"><strong>Скрипты package.json</strong></div>
						{!loading && scripts.length === 0 && <Typography.Text type="secondary">Скрипты не найдены в корне проекта</Typography.Text>}
						{scripts.map((script) => (
							<div className="project-commands__item" key={script.name}>
								<div className="project-commands__text"><strong>{script.name}</strong><code>{script.command}</code></div>
								<Button aria-label={`Запустить ${script.name}`} icon={<Play size={14} />} loading={running === `npm:${script.name}`} disabled={running !== null} onClick={() => void run({ type: "npm", id: script.name })} />
							</div>
						))}
						<div className="project-commands__header"><strong>Свои команды</strong><Button size="small" icon={<Plus size={14} />} onClick={() => { form.resetFields(); setEditor("new"); }}>Добавить</Button></div>
						{!project.commands?.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Своих команд пока нет" />}
						{project.commands?.map((item) => (
							<div className="project-commands__item" key={item.id}>
								<div className="project-commands__text"><strong>{item.name}</strong><code>{item.command}</code></div>
								<Space size={4}>
									<Button aria-label={`Запустить ${item.name}`} icon={<Play size={14} />} loading={running === `custom:${item.id}`} disabled={running !== null} onClick={() => void run({ type: "custom", id: item.id })} />
									<Button aria-label={`Изменить ${item.name}`} icon={<Pencil size={14} />} onClick={() => { form.setFieldsValue(item); setEditor(item); }} />
									<Button aria-label={`Удалить ${item.name}`} icon={<Trash2 size={14} />} onClick={() => Modal.confirm({ title: `Удалить «${item.name}»?`, content: "Команда будет удалена из Hangar.", okText: "Удалить", okButtonProps: { danger: true }, cancelText: "Отмена", onOk: () => remove(item) })} />
								</Space>
							</div>
						))}
					</div>
				</Spin>
			</Modal>
			<Modal title={editor === "new" ? "Новая команда" : "Редактировать команду"} open={editor !== null} onCancel={() => setEditor(null)} onOk={() => void save()} okText="Сохранить" cancelText="Отмена" confirmLoading={saving} destroyOnHidden>
				<Form form={form} layout="vertical" onFinish={() => void save()}>
					<Form.Item name="name" label="Название" rules={[{ required: true, whitespace: true, message: "Введите название" }]}><Input autoFocus placeholder="Запустить приложение" /></Form.Item>
					<Form.Item name="command" label="Команда" extra="Команда выполняется выбранной в настройках оболочкой в папке проекта." rules={[{ required: true, whitespace: true, message: "Введите команду" }]}><Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="npm run dev" /></Form.Item>
				</Form>
			</Modal>
		</>
	);
};
