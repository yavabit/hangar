import { FC, useEffect, useState } from "react";
import { Button } from "antd";
import { Copy, Info, RefreshCw } from "lucide-react";
import type { DevInfo } from "@common/api/api.types";
import { useAppNotification } from "@renderer/shared/hooks/useAppNotification";
import { useAppStore } from "@renderer/store/app.store";

type Row = [label: string, value: string];
type Group = { title: string; rows: Row[]; mono?: boolean };

const formatBytes = (bytes: number): string => {
	if (bytes >= 1024 ** 3) {
		return `${(bytes / 1024 ** 3).toFixed(1)} ГБ`;
	}
	if (bytes >= 1024 ** 2) {
		return `${(bytes / 1024 ** 2).toFixed(1)} МБ`;
	}
	return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
};

const formatUptime = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return hours ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
};

const colorGamut = (): string =>
	["rec2020", "p3", "srgb"].find((gamut) => window.matchMedia(`(color-gamut: ${gamut})`).matches) ?? "-";

const buildGroups = (info: DevInfo, theme: string, mica: boolean): Group[] => [
	{
		title: "Приложение",
		rows: [
			["Версия", info.app.version],
			["Сборка", info.app.packaged ? "установленное приложение" : "npm run dev"],
			["Работает", formatUptime(info.app.uptime)],
			["Файл", info.app.executable],
		],
	},
	{
		title: "Система",
		rows: [
			["ОС", info.system.name],
			["Платформа", `${info.system.platform} ${info.system.arch}`],
			["Процессор", `${info.system.cpu}, ${info.system.cores} потоков`],
			["Память", formatBytes(info.system.memory)],
			["Язык", info.system.locale],
			["Экран", `${window.screen.width}×${window.screen.height}, масштаб ${window.devicePixelRatio * 100}%`],
			["Цветовой охват", colorGamut()],
			["Тема", `${theme}${mica ? ", фон Mica" : ""}`],
		],
	},
	{
		title: "Данные",
		rows: [
			["Проекты", String(info.data.projects)],
			["Папки", String(info.data.folders)],
			["Алиасы", String(info.data.aliases)],
			["Размер файла", formatBytes(info.data.dataSize)],
			["Файл данных", info.data.dataFile],
		],
	},
	{ title: "Движок", rows: Object.entries(info.engine), mono: true },
	{ title: "Пакеты", rows: Object.entries(info.packages), mono: true },
];

const toText = (groups: Group[]): string =>
	groups.map((group) => [`## ${group.title}`, ...group.rows.map(([label, value]) => `${label}: ${value}`)].join("\n")).join("\n\n");

/** Сведения о сборке, системе и данных. Копируются одним текстом — для отчёта об ошибке */
export const DevInfoCard: FC = () => {
	const theme = useAppStore((s) => s.settings.appearance.theme);
	const mica = useAppStore((s) => s.window.mica);
	const { showSuccess } = useAppNotification();
	const [info, setInfo] = useState<DevInfo | null>(null);

	const load = (): void => {
		void window.api.dev.getInfo().then(setInfo);
	};

	useEffect(load, []);

	const groups = info ? buildGroups(info, theme, mica) : [];

	const copy = async (): Promise<void> => {
		await window.api.dev.copyText(toText(groups));
		showSuccess("dev_copy", { message: "Сведения скопированы" });
	};

	return (
		<section className="settings-card settings-card--column glass">
			<div className="settings-card__row">
				<div className="settings-card__head">
					<Info size={18} strokeWidth={1.8} />
					<div>
						<div className="settings-card__title">Информация</div>
						<div className="settings-card__text">Сборка, система, данные и версии пакетов</div>
					</div>
				</div>
				<div className="dev-info__actions">
					<Button icon={<RefreshCw size={14} />} onClick={load}>
						Обновить
					</Button>
					<Button icon={<Copy size={14} />} disabled={!info} onClick={() => void copy()}>
						Копировать
					</Button>
				</div>
			</div>

			<div className="dev-info">
				{groups.map((group) => (
					<div key={group.title} className={`dev-info__group ${group.mono ? "dev-info__group--mono" : ""}`}>
						<div className="dev-info__title">{group.title}</div>
						<dl className="dev-info__list">
							{group.rows.map(([label, value]) => (
								<div key={label} className="dev-info__row">
									<dt title={label}>{label}</dt>
									<dd>{value}</dd>
								</div>
							))}
						</dl>
					</div>
				))}
			</div>
		</section>
	);
};
