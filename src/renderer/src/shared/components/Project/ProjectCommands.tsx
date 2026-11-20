import { FC, useEffect, useState } from "react";
import { Alert, Button, Empty, Form, Input, Modal, Select, Space, Spin, Typography } from "antd";
import { Pencil, Play, Plus, Terminal, Trash2 } from "lucide-react";
import type { Project } from "@schemas/store.schema";
import type { ProjectCommandRef, ProjectCommandShell, ProjectNpmScript } from "@common/api/api.types";
import { projectsApi } from "@renderer/shared/api/projects.api";
import { useProjects } from "@renderer/shared/hooks/useProjects";
import { getIpcErrorMessage } from "@renderer/shared/utils/ipcError";
import { CardAction } from "@renderer/shared/components/UI/CardAction/CardAction";
import { useAppStore } from "@renderer/store/app.store";

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
	const defaultConsole = useAppStore((s) => s.settings.common.defaultConsole);
	const platform = useAppStore((s) => s.window.platform);
	const options: { value: ProjectCommandShell; label: string }[] = platform === "win32"
		? [{ value: "powershell", label: "PowerShell" }, { value: "cmd", label: "CMD" }, { value: "bash", label: "Bash" }]
		: [{ value: "bash", label: "Bash" }, { value: "zsh", label: "Zsh" }];
	const [shell, setShell] = useState<ProjectCommandShell>(() =>
		options.find((option) => option.value === defaultConsole)?.value ?? options[0].value,
	);
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
		void Promise.resolve().then(() => {
			if (typeof window.api?.projects?.getNpmScripts !== "function") {
				throw new Error("Обновление приложения ещё не загружено. Перезапустите Hangar и попробуйте снова.");
			}
			return projectsApi.getNpmScripts(project.id);
		})
			.then((items) => { if (active) setScripts(items); })
			.catch((e: unknown) => { if (active) setError(getIpcErrorMessage(e)); })
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [project.id]);

	const run = async (ref: ProjectCommandRef): Promise<void> => {
		setRunning(`${ref.type}:${ref.id}`);
		setError(null);
		try {
			await projectsApi.runCommand(project.id, ref, shell);
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
				<Typography.Paragraph type="secondary">Команды запускаются в папке проекта. Выбор действует только для этого запуска и не меняет настройки.</Typography.Paragraph>
				<div className="project-commands__terminal">
					<label htmlFor="project-command-shell">Оболочка</label>
					<Select id="project-command-shell" value={shell} options={options} onChange={setShell} disabled={running !== null} style={{ width: 180 }} />
				</div>
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
					<Form.Item name="command" label="Команда" extra="Команда выполняется выбранной оболочкой в папке проекта." rules={[{ required: true, whitespace: true, message: "Введите команду" }]}><Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="npm run dev" /></Form.Item>
				</Form>
			</Modal>
		</>
	);
};
