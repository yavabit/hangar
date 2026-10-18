import { FC, ReactNode, useEffect, useState } from "react";
import { Modal, Switch } from "antd";
import { Bug, FolderOpen, Power, RotateCw, Sparkles, SquareTerminal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DevInfo } from "@common/api/api.types";
import { useSettings } from "@renderer/shared/hooks/useSettings";
import { useUiStore } from "@renderer/store/ui.store";

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

/** Служебные инструменты: посмотреть первый запуск, стереть данные, открыть DevTools */
export const DeveloperSettings: FC = () => {
	const navigate = useNavigate();
	const { settings, updateSettings } = useSettings();
	const setOnboardingPreview = useUiStore((s) => s.setOnboardingPreview);
	const [modal, modalContextHolder] = Modal.useModal();
	const [info, setInfo] = useState<DevInfo | null>(null);

	const enabled = settings.developer.enabled;

	useEffect(() => {
		if (enabled) {
			void window.api.dev.getInfo().then(setInfo);
		}
	}, [enabled]);

	const confirmReset = (): void => {
		modal.confirm({
			title: "Стереть все данные?",
			icon: <Trash2 size={22} color="var(--danger)" style={{ marginRight: 10 }} />,
			content: "Будут удалены все проекты, папки, алиасы и настройки. Сами папки проектов на диске не трогаются. Приложение перезапустится с экраном первого запуска.",
			okText: "Стереть и перезапустить",
			okButtonProps: { danger: true },
			cancelText: "Отмена",
			onOk: async () => {
				useUiStore.persist.clearStorage();
				await window.api.dev.resetData();
			},
		});
	};

	return (
		<section className="settings-card settings-card--column glass">
			{modalContextHolder}
			<div className="settings-card__row">
				<div className="settings-card__head">
					<SquareTerminal size={18} strokeWidth={1.8} />
					<div>
						<div className="settings-card__title">Режим разработчика</div>
						<div className="settings-card__text">Служебные инструменты для отладки, включается сразу</div>
					</div>
				</div>
				<Switch
					checked={enabled}
					onChange={(value) => void updateSettings({ ...settings, developer: { enabled: value } }, { silent: true })}
				/>
			</div>

			{enabled && (
				<div className="dev-tools">
					<Tool
						icon={<Sparkles size={16} />}
						title="Показать приветствие"
						text="Экран первого запуска, данные останутся на месте"
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
						text={<span className="mono">{info?.dataFile ?? "…"}</span>}
						onClick={() => void window.api.dev.openDataFolder()}
					/>
					<Tool
						icon={<Power size={16} />}
						title="Перезапустить приложение"
						text={info ? `Версия ${info.version}` : "Полный перезапуск"}
						onClick={() => void window.api.dev.relaunch()}
					/>
					<Tool
						icon={<Trash2 size={16} />}
						title="Стереть все данные"
						text="Проекты, папки и настройки — как после установки"
						danger
						onClick={confirmReset}
					/>
				</div>
			)}
		</section>
	);
};
