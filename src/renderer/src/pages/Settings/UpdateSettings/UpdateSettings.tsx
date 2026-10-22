import { FC } from "react";
import { Button, Progress, Switch } from "antd";
import { ArrowDownToLine, ExternalLink, RefreshCw, RotateCcw } from "lucide-react";
import type { AppSettings } from "@schemas/store.schema";
import type { UpdateStatus } from "@common/api/api.types";
import { useSettings } from "@renderer/shared/hooks/useSettings";
import { useAppStore } from "@renderer/store/app.store";
import { formatRelativeTime } from "@renderer/shared/utils/relativeTime";

const describe = (update: UpdateStatus, autoCheck: boolean): string => {
	switch (update.state) {
		case "disabled":
			return "В режиме разработки обновления не проверяются";
		case "idle":
			return autoCheck ? "Проверка начнётся через полминуты после запуска" : "Автоматическая проверка выключена";
		case "checking":
			return "Проверяем…";
		case "latest":
			return `Установлена последняя версия · проверено ${formatRelativeTime(update.checkedAt ?? undefined)}`;
		case "available":
			return update.canInstall
				? `Доступна версия ${update.version}`
				: `Доступна версия ${update.version}. На macOS её нужно скачать и установить вручную`;
		case "downloading":
			return `Скачиваем версию ${update.version}`;
		case "ready":
			return `Версия ${update.version} скачана и установится при перезапуске или выходе из приложения`;
		case "error":
			return `Не удалось обновиться: ${update.message}`;
	}
};

const UpdateAction: FC<{ update: UpdateStatus }> = ({ update }) => {
	switch (update.state) {
		case "disabled":
			return null;
		case "available":
			return update.canInstall ? (
				<Button type="primary" icon={<ArrowDownToLine size={14} />} onClick={() => void window.api.updates.download()}>
					Скачать
				</Button>
			) : (
				<Button type="primary" icon={<ExternalLink size={14} />} href={update.releaseUrl} target="_blank">
					Страница загрузки
				</Button>
			);
		case "downloading":
			return <Button loading>Скачивается</Button>;
		case "ready":
			return (
				<Button type="primary" icon={<RotateCcw size={14} />} onClick={() => void window.api.updates.install()}>
					Перезапустить и обновить
				</Button>
			);
		default:
			return (
				<Button
					icon={<RefreshCw size={14} />}
					loading={update.state === "checking"}
					onClick={() => void window.api.updates.check()}
				>
					Проверить
				</Button>
			);
	}
};

/** Статус обновлений и их настройки. Переключатели сохраняются сразу, как тема и режим разработчика */
export const UpdateSettings: FC = () => {
	const { settings, updateSettings } = useSettings();
	const update = useAppStore((s) => s.update);
	const version = useAppStore((s) => s.version);
	const nextVersion = "version" in update ? update.version : null;
	const onPrerelease = version.includes("-");
	const disabled = update.state === "disabled";

	const setUpdates = (patch: Partial<AppSettings["updates"]>): void => {
		void updateSettings({ ...settings, updates: { ...settings.updates, ...patch } }, { silent: true });
	};

	return (
		<section className="settings-card settings-card--column glass">
			<div className="settings-card__row">
				<div className="settings-card__head">
					<RefreshCw size={18} strokeWidth={1.8} />
					<div>
						<div className="settings-card__title">
							Обновления
							<span className="settings-card__version mono">
								v{version}
								{nextVersion && <> → v{nextVersion}</>}
							</span>
						</div>
						<div className="settings-card__text">
							{describe(update, settings.updates.autoCheck)}
							{(update.state === "available" || update.state === "ready") && (
								<>
									{" · "}
									<a href={update.releaseUrl} target="_blank" rel="noreferrer">
										Что нового
									</a>
								</>
							)}
						</div>
					</div>
				</div>
				<UpdateAction update={update} />
			</div>

			{update.state === "downloading" && <Progress percent={update.percent} size="small" strokeColor="var(--accent)" />}

			<div className="update-options">
				<label className="update-option">
					<Switch
						size="small"
						checked={settings.updates.autoCheck}
						disabled={disabled}
						onChange={(autoCheck) => setUpdates({ autoCheck })}
					/>
					<span>
						Проверять автоматически
						<span className="update-option__hint">при запуске и раз в 6 часов, запрос к GitHub</span>
					</span>
				</label>
				{update.canInstall && (
					<label className="update-option">
						<Switch
							size="small"
							checked={settings.updates.autoDownload}
							disabled={disabled}
							onChange={(autoDownload) => setUpdates({ autoDownload })}
						/>
						<span>
							Скачивать сразу
							<span className="update-option__hint">иначе — по кнопке «Скачать»</span>
						</span>
					</label>
				)}
				<label className="update-option">
					<Switch
						size="small"
						checked={onPrerelease || settings.updates.prerelease}
						disabled={disabled || onPrerelease}
						onChange={(prerelease) => setUpdates({ prerelease })}
					/>
					<span>
						Ранние версии
						<span className="update-option__hint">
							{onPrerelease
								? "у вас альфа-версия, ранние версии приходят всегда"
								: "альфы и беты: новое раньше, но возможны ошибки"}
						</span>
					</span>
				</label>
			</div>
		</section>
	);
};
