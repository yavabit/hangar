import { FC, useEffect, useState } from "react";
import {
	Form,
	Input,
	InputNumber,
	Select,
	Switch,
	Button,
	Card,
	Space,
	Divider,
	Modal,
} from "antd";
import { CodeOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useBlocker } from "react-router-dom";
import type { AppSettings } from "@schemas/store.schema";
import { PathAliasesManager } from "./PathAliasesManager/PathAliasesManager";
import { validatePathAliases } from "./PathAliasesManager/validatePathAliases";
import { HotkeyInput } from "./HotkeyInput/HotkeyInput";
import { useSettings } from "@renderer/shared/hooks/useSettings";

export const SettingsForm: FC = () => {

	const { settings, updateSettings } = useSettings()

	const [form] = Form.useForm<AppSettings>();
	const [modal, modalContextHolder] = Modal.useModal();

	const [formEdited, setFormEdited] = useState(false);
	const [saving, setSaving] = useState(false);

	const blocker = useBlocker(
		({ currentLocation, nextLocation }) => formEdited && currentLocation.pathname !== nextLocation.pathname,
	);

	useEffect(() => {
		form.setFieldsValue(settings);
	}, [form, settings]);

	const resetForm = (): void => {
		form.setFieldsValue(settings);
		setFormEdited(false);
	};

	const save = async (): Promise<boolean> => {
		try {
			await form.validateFields();
		} catch {
			return false;
		}

		setSaving(true);
		const saved = await updateSettings(form.getFieldsValue(true) as AppSettings);
		setSaving(false);

		if (saved) {
			setFormEdited(false);
		}
		return saved;
	};

	useEffect(() => {
		if (blocker.state !== "blocked") {
			return;
		}

		const instance = modal.confirm({
			title: "Сохранить изменения в настройках?",
			icon: <ExclamationCircleFilled />,
			content: "Вы изменили настройки, но не сохранили их.",
			closable: true,
			onCancel: () => blocker.reset(),
			footer: () => (
				<Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
					<Button
						onClick={() => {
							instance.destroy();
							blocker.reset();
						}}
					>
						Остаться
					</Button>
					<Button
						danger
						onClick={() => {
							instance.destroy();
							blocker.proceed();
						}}
					>
						Не сохранять
					</Button>
					<Button
						type="primary"
						onClick={async () => {
							instance.destroy();
							if (await save()) {
								blocker.proceed();
							} else {
								blocker.reset();
							}
						}}
					>
						Сохранить
					</Button>
				</Space>
			),
		});

		return () => instance.destroy();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blocker, modal]);

	return (
		<Card
			title={
				<div style={{ fontSize: 20, fontWeight: 500 }}>Настройки системы</div>
			}
			style={{ maxWidth: 1000, margin: "0 auto" }}
		>
			{modalContextHolder}
			<Form
				form={form}
				layout="vertical"
				onFinish={() => void save()}
				onValuesChange={() => setFormEdited(true)}
			>
				<Divider titlePlacement="start">Основные настройки</Divider>

				<Form.Item
					name={["common", "pathAliases"]}
					label="Алиасы путей"
					tooltip="Сокращения для часто используемых папок. Проекты внутри них хранят путь через алиас: если папка переедет, достаточно поменять путь здесь"
					rules={[{ validator: validatePathAliases }]}
				>
					<PathAliasesManager />
				</Form.Item>

				<Form.Item
					name={["common", "defaultIDE"]}
					label="IDE по умолчанию"
					tooltip="Какую IDE использовать для открытия проектов"
					rules={[{ required: true, message: "Выберите IDE" }]}
				>
					<Select
						options={[
							{
								value: "vscode",
								label: (
									<Space>
										<CodeOutlined />
										VS Code
									</Space>
								),
							},
							{
								value: "webstorm",
								label: (
									<Space>
										<CodeOutlined />
										WebStorm
									</Space>
								),
							},
							{
								value: "intellij",
								label: (
									<Space>
										<CodeOutlined />
										IntelliJ IDEA
									</Space>
								),
							},
						]}
					/>
				</Form.Item>

				<Form.Item
					name={["common", "defaultConsole"]}
					label="Консоль по умолчанию"
					tooltip="В какой консоли запускать скрипты проектов"
					rules={[{ required: true, message: "Выберите консоль" }]}
				>
					<Select
						options={[
							{
								value: "cmd",
								label: "CMD (Windows)",
							},
							{
								value: "powershell",
								label: "PowerShell",
							},
							{
								value: "bash",
								label: "Bash",
							},
							{
								value: "zsh",
								label: "Zsh",
							},
						]}
					/>
				</Form.Item>

				<Form.Item
					name={["common", "taskTrackerUrl"]}
					label="Таск-трекер"
					tooltip="Базовый адрес трекера. В проекте останется дописать номер задачи или путь к доске"
					extra="Например: https://redmine.company.com/issues"
					rules={[{ type: "url", message: "Введите адрес, например https://redmine.company.com/issues" }]}
				>
					<Input placeholder="https://redmine.example.com/issues" />
				</Form.Item>

				<Divider titlePlacement="start">Быстрый доступ</Divider>

				<Form.Item
					name={["common", "globalHotkey"]}
					label="Глобальное сочетание клавиш"
					tooltip="Работает из любого приложения: показывает лаунчер и открывает поиск проекта. Внутри окна поиск всегда открывается по Ctrl+K"
					extra="Нажмите на поле и затем нужное сочетание. Нужна хотя бы одна из клавиш Ctrl, Alt или ⌘"
				>
					<HotkeyInput />
				</Form.Item>

				<Form.Item
					name={["common", "minimizeToTray"]}
					label="Сворачивать в трей при закрытии"
					tooltip="Крестик прячет окно, приложение остаётся в трее и вызывается сочетанием клавиш. Выйти можно через меню трея"
					valuePropName="checked"
				>
					<Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
				</Form.Item>

				<Divider titlePlacement="start">Обновление статусов</Divider>

				<Form.Item
					name={["statusRefresh", "onFocus"]}
					label="При возврате в окно"
					tooltip="Проверять git и даты изменения, когда вы переключаетесь в лаунчер. Наличие папок проверяется всегда — это быстро"
					valuePropName="checked"
				>
					<Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
				</Form.Item>

				<Form.Item
					name={["statusRefresh", "background"]}
					label="По таймеру"
					tooltip="Проверять с заданным интервалом, пока окно открыто. Когда лаунчер свёрнут в трей, проверки не идут"
					valuePropName="checked"
				>
					<Switch checkedChildren="Вкл" unCheckedChildren="Выкл" />
				</Form.Item>

				<Form.Item
					name={["statusRefresh", "intervalMinutes"]}
					label="Интервал"
					tooltip="Git и даты изменения проверяются не чаще этого интервала. Кнопка обновления на страницах проектов проверяет сразу"
					rules={[{ required: true, message: "Укажите интервал" }]}
				>
					<InputNumber min={1} max={240} suffix="мин" style={{ width: 160 }} />
				</Form.Item>

				<Form.Item style={{
					marginTop: 24,
					position: formEdited ? "sticky" : "static",
					bottom: 0,
					backgroundColor: "white",
					padding: '20px 0px',
					zIndex: 2,
				}}>
					<Space>
						<Button type="primary" htmlType="submit" disabled={!formEdited} loading={saving}>
							Сохранить настройки
						</Button>
						<Button htmlType="button" onClick={resetForm} disabled={!formEdited}>
							Сбросить
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</Card>
	);
};
