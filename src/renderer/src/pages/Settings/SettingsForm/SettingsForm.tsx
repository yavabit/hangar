import { FC, useEffect, useState } from "react";
import {
	Form,
	Input,
	Select,
	Switch,
	Button,
	Card,
	Space,
	Divider,
} from "antd";
import {
	GitlabOutlined,
	GithubOutlined,
	CodeOutlined,
} from "@ant-design/icons";
import { AppSettings } from "@schemas/store.schema";
import { PathAliasesManager } from "./PathAliasesManager/PathAliasesManager";
import { useSettings } from "@renderer/shared/hooks/useSettings";

export const SettingsForm: FC = () => {

	const { settings, updateSettings } = useSettings()

	const [form] = Form.useForm<AppSettings>();

	const [gitSynch, setGitSynch] = useState(false);
	const [formEdited, setFormEdited] = useState(false);

	const onFinish = (values: AppSettings): void => {
		updateSettings(values)
	};

	const onFormChange = (): void => {
		setFormEdited(true);
	};

	const onFormReset = (): void => {
		form.resetFields();
		setFormEdited(false);
	};

	useEffect(() => {
		if(settings) {
			form.setFieldsValue(settings)
		}
	}, [settings])

	return (
		<Card
			title={
				<div style={{ fontSize: 20, fontWeight: 500 }}>Настройки системы</div>
			}
			style={{ maxWidth: 1000, margin: "0 auto" }}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={onFinish}
				onValuesChange={onFormChange}
			>
				{/* Common Settings */}
				<Divider titlePlacement="start">Основные настройки</Divider>

				<Form.Item
					name={["common", "pathAliases"]}
					label="Алиасы путей"
					tooltip="Создайте сокращения для часто используемых путей"
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
					tooltip="Какую консоль использовать для команд"
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
					label="Ссылка на таск-трекер"
					tooltip="Путь до таск-трекера по умолчанию для отслеживания задач"
					extra="Например: https://redmine.company.com"
				>
					<Input placeholder="https://redmine.example.com" />
				</Form.Item>

				{/* Git Settings */}
				<Divider titlePlacement="start">Настройки Git</Divider>

				<Form.Item
					name={["git", "gitSynch"]}
					label="Синхронизация с Git"
					tooltip="Включить автоматическую синхронизацию с Git репозиторием"
					valuePropName="checked"
				>
					<Switch
						checkedChildren="Вкл"
						unCheckedChildren="Выкл"
						onChange={setGitSynch}
					/>
				</Form.Item>

				{gitSynch && (
					<Space orientation="vertical" style={{ width: "100%" }} size="middle">
						<Form.Item
							name={["git", "gitProvider"]}
							label="Git провайдер"
							tooltip="Выберите систему контроля версий"
							rules={[{ required: true, message: "Выберите Git провайдера" }]}
						>
							<Select
								options={[
									{
										value: "github",
										label: (
											<Space>
												<GithubOutlined />
												GitHub
											</Space>
										),
									},
									{
										value: "gitlab",
										label: (
											<Space>
												<GitlabOutlined />
												GitLab
											</Space>
										),
									},
								]}
							></Select>
						</Form.Item>

						<Form.Item
							name={["git", "url"]}
							label="Git репозиторий URL"
							tooltip="URL для клонирования репозитория"
							rules={[
								{ required: gitSynch, message: "Введите URL репозитория" },
								{ type: "url", message: "Введите корректный URL" },
							]}
							extra="Пример: https://github.com/user/repo.git"
						>
							<Input placeholder="https://github.com/user/repo.git" />
						</Form.Item>

						<Form.Item
							name="apiKey"
							label="API ключ"
							tooltip="API ключ для доступа к Git провайдеру"
							rules={[{ required: gitSynch, message: "Введите API ключ" }]}
							extra="Токен доступа для работы с Git API"
						>
							<Input.Password placeholder="ghp_xxxxxxxxxxxx" />
						</Form.Item>
					</Space>
				)}

				<Form.Item style={{ 
					marginTop: 24,
					position: formEdited ? "sticky" : "static",
					bottom: 0,
					backgroundColor: "white",
					padding: '20px 0px'
				}}>
					<Space>
						<Button type="primary" htmlType="submit" disabled={!formEdited} color="green">
							Сохранить настройки
						</Button>
						<Button htmlType="button" onClick={onFormReset} disabled={!formEdited}>
							Сбросить
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</Card>
	);
};
