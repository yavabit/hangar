import { FC, ReactNode, useState } from "react";
import { Modal, Select, Switch } from "antd";
import {
	Bug,
	Download,
	FolderOpen,
	Power,
	RotateCw,
	Sparkles,
	SquareTerminal,
	Trash2,
	Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UpdateStatus } from "@common/api/api.types";
import { useSettings } from "@renderer/shared/hooks/useSettings";
import { useAppNotification } from "@renderer/shared/hooks/useAppNotification";
import { getIpcErrorMessage } from "@renderer/shared/utils/ipcError";
import { useUiStore } from "@renderer/store/ui.store";
import { useAppStore } from "@renderer/store/app.store";
import { DevInfoCard } from "./DevInfoCard";

type ToolProps = {
	icon: ReactNode;
	title: string;
	text: ReactNode;
	danger?: boolean;
	onClick: () => void;
};

const Tool: FC<ToolProps> = ({ icon, title, text, danger = false, onClick }) => (
	<button type="button" className={`dev-tool ${danger ? "dev-tool--danger" : ""}`} onClick={onClick}>
		<span className="dev-tool__icon">{icon}</span>
		<span className="dev-tool__body">
			<span className="dev-tool__title">{title}</span>
			<span className="dev-tool__text">{text}</span>
		</span>
	</button>
);

const PREVIEW_RELEASE = "https://github.com/yavabit/project-launcher/releases/latest";

/** Состояния обновления для проверки интерфейса: в npm run dev настоящие обновления не проверяются */
const UPDATE_PREVIEWS: Record<string, UpdateStatus> = {
	idle: { state: "idle", checkedAt: null, canInstall: true, releaseUrl: PREVIEW_RELEASE },
	checking: { state: "checking", checkedAt: null, canInstall: true, releaseUrl: PREVIEW_RELEASE },
	latest: { state: "latest", checkedAt: new Date().toISOString(), canInstall: true, releaseUrl: PREVIEW_RELEASE },
	available: { state: "available", version: "9.9.9", checkedAt: null, canInstall: true, releaseUrl: PREVIEW_RELEASE },
	"available-mac": { state: "available", version: "9.9.9", checkedAt: null, canInstall: false, releaseUrl: PREVIEW_RELEASE },
	downloading: { state: "downloading", version: "9.9.9", percent: 42, checkedAt: null, canInstall: true, releaseUrl: PREVIEW_RELEASE },
	ready: { state: "ready", version: "9.9.9", checkedAt: null, canInstall: true, releaseUrl: PREVIEW_RELEASE },
	error: { state: "error", message: "net::ERR_INTERNET_DISCONNECTED", checkedAt: null, canInstall: true, releaseUrl: PREVIEW_RELEASE },
};

const UPDATE_PREVIEW_OPTIONS = [
	{ value: "real", label: "Как на самом деле" },
	{ value: "idle", label: "Ещё не проверялось" },
	{ value: "checking", label: "Проверяем" },
	{ value: "latest", label: "Последняя версия" },
	{ value: "available", label: "Доступна новая" },
	{ value: "available-mac", label: "Доступна новая (macOS)" },
	{ value: "downloading", label: "Скачивается" },
	{ value: "ready", label: "Готово к установке" },
	{ value: "error", label: "Ошибка" },
];

/** Служебные инструменты: первый запуск, перенос данных, DevTools, сведения о сборке и системе */
export const DeveloperSettings: FC = () => {
	const navigate = useNavigate();
	const { settings, updateSettings } = useSettings();
	const { showSuccess, showError } = useAppNotification();
	const setOnboardingPreview = useUiStore((s) => s.setOnboardingPreview);
	const packaged = useAppStore((s) => s.packaged);
	const setUpdate = useAppStore((s) => s.setUpdate);
	const [modal, modalContextHolder] = Modal.useModal();
	const [updatePreview, setUpdatePreview] = useState("real");

	const enabled = settings.developer.enabled;
	const relaunchText = packaged ? "Приложение перезапустится" : "Окна перезагрузятся";

	const previewUpdate = (value: string): void => {
		setUpdatePreview(value);
		if (value === "real") {
			void window.api.updates.getStatus().then(setUpdate);
		} else {
			setUpdate(UPDATE_PREVIEWS[value]);
		}
	};

	const confirmReset = (): void => {
		modal.confirm({
			title: "Стереть все данные?",
			icon: <Trash2 size={22} color="var(--danger)" style={{ marginRight: 10 }} />,
			content: `Будут удалены все проекты, папки, алиасы и настройки. ${relaunchText}.`,
			okText: packaged ? "Стереть и перезапустить" : "Стереть",
			okButtonProps: { danger: true },
			cancelText: "Отмена",
			onOk: async () => {
				useUiStore.persist.clearStorage();
				await window.api.dev.resetData();
			},
		});
	};

	const exportData = async (): Promise<void> => {
		try {
			const path = await window.api.dev.exportData();
			if (path) {
				showSuccess("dev_export", { message: "Данные сохранены", description: path, duration: 5 });
			}
		} catch (e) {
			showError("dev_export", { message: "Не удалось сохранить данные", description: getIpcErrorMessage(e) });
		}
	};

	const importData = async (): Promise<void> => {
		try {
			const preview = await window.api.dev.pickImport();
			if (!preview) {
				return;
			}

			const from = [
				preview.appVersion && `Hangar ${preview.appVersion}`,
				preview.exportedAt && new Date(preview.exportedAt).toLocaleString("ru-RU"),
			]
				.filter(Boolean)
				.join(", ");

			modal.confirm({
				title: "Заменить данные?",
				icon: <Upload size={22} color="var(--accent)" style={{ marginRight: 10 }} />,
				content: (
					<div className="dev-import">
						<div>
							<b>{preview.file}</b>
							{from && <span className="dev-import__meta"> · {from}</span>}
						</div>
						<div>
							Проектов: {preview.projects}, папок: {preview.folders}, алиасов: {preview.aliases}
						</div>
						<div className="dev-import__meta">
							Текущие проекты, папки и настройки заменятся, их копия останется в папке с данными. Если на этом
							компьютере проекты лежат в других папках, поправьте пути алиасов в настройках. {relaunchText}.
						</div>
					</div>
				),
				okText: "Заменить",
				cancelText: "Отмена",
				onOk: async () => {
					try {
						useUiStore.persist.clearStorage();
						await window.api.dev.applyImport();
					} catch (e) {
						showError("dev_import", { message: "Не удалось загрузить данные", description: getIpcErrorMessage(e) });
					}
				},
			});
		} catch (e) {
			showError("dev_import", { message: "Файл не подходит", description: getIpcErrorMessage(e), duration: 8 });
		}
	};

	return (
		<>
			<section className="settings-card settings-card--column glass">
				{modalContextHolder}
				<div className="settings-card__row">
					<div className="settings-card__head">
						<SquareTerminal size={18} strokeWidth={1.8} />
						<div>
							<div className="settings-card__title">Режим разработчика</div>
							<div className="settings-card__text">Служебные инструменты для отладки и переноса данных</div>
						</div>
					</div>
					<Switch
						checked={enabled}
						onChange={(value) => {
							if (!value && updatePreview !== "real") {
								previewUpdate("real");
							}
							void updateSettings({ ...settings, developer: { enabled: value } }, { silent: true });
						}}
					/>
				</div>

				{enabled && (
					<>
						<div className="dev-tools">
							<Tool
								icon={<Download size={16} />}
								title="Выгрузить данные"
								text="Проекты, папки и настройки в файл JSON"
								onClick={() => void exportData()}
							/>
							<Tool
								icon={<Upload size={16} />}
								title="Загрузить данные"
								text="Из файла выгрузки, например с другого компьютера"
								onClick={() => void importData()}
							/>
							<Tool
								icon={<Sparkles size={16} />}
								title="Показать приветствие"
								text="Экран первого запуска"
								onClick={() => {
									setOnboardingPreview(true);
									navigate("/");
								}}
							/>
							<Tool
								icon={<RotateCw size={16} />}
								title="Перезагрузить интерфейс"
								text="Заново покажет заставку загрузки"
								onClick={() => window.location.reload()}
							/>
							<Tool
								icon={<Bug size={16} />}
								title="Инструменты разработчика"
								text="DevTools в отдельном окне"
								onClick={() => void window.api.dev.openDevTools()}
							/>
							<Tool
								icon={<FolderOpen size={16} />}
								title="Папка с данными"
								text="Файл данных, копии и workspace для VS Code"
								onClick={() => void window.api.dev.openDataFolder()}
							/>
							<Tool
								icon={<Power size={16} />}
								title="Перезапустить приложение"
								text={packaged ? "Закрыть и снова открыть Hangar" : "В npm run dev только перезагрузит окна"}
								onClick={() => void window.api.dev.relaunch()}
							/>
							<Tool
								icon={<Trash2 size={16} />}
								title="Стереть все данные"
								text="Проекты, папки и настройки будут удалены"
								danger
								onClick={confirmReset}
							/>
						</div>

						<div className="dev-row">
							<div>
								<div className="dev-row__title">Статус обновления</div>
								<div className="dev-row__text">
									Подменяет статус в этом окне, чтобы посмотреть блок «Обновления», уведомление и точку в меню. Кнопки при
									этом ничего не делают
								</div>
							</div>
							<Select
								size="small"
								value={updatePreview}
								options={UPDATE_PREVIEW_OPTIONS}
								onChange={previewUpdate}
								style={{ width: 220 }}
							/>
						</div>
					</>
				)}
			</section>

			{enabled && <DevInfoCard />}
		</>
	);
};
