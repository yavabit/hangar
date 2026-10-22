import { FC } from "react";
import { Palette, ShieldCheck } from "lucide-react";
import { Versions } from "@renderer/shared/components/Versions";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";
import { ThemeSwitcher } from "@renderer/shared/components/ThemeSwitcher/ThemeSwitcher";
import { SettingsForm } from "./SettingsForm/SettingsForm";
import { DeveloperSettings } from "./DeveloperSettings/DeveloperSettings";
import { UpdateSettings } from "./UpdateSettings/UpdateSettings";
import { useAppStore } from "@renderer/store/app.store";

import "./Settings.scss";

export const Settings: FC = () => {
	const version = useAppStore((s) => s.version);

	return (
		<div className="settings-page">
			<PageHeader title="Настройки" description="Оформление, IDE, консоль, алиасы путей и быстрый доступ" />

			<section className="settings-note">
				<ShieldCheck size={16} strokeWidth={1.8} />
				<span>
					Проекты и настройки хранятся только на этом устройстве и никуда не отправляются. В интернет Hangar обращается
					лишь за проверкой обновлений на GitHub — её можно выключить в блоке «Обновления».
				</span>
			</section>

			<section className="settings-card glass">
				<div className="settings-card__head">
					<Palette size={18} strokeWidth={1.8} />
					<div>
						<div className="settings-card__title">Оформление</div>
						<div className="settings-card__text">Светлая и темная темы на выбор</div>
					</div>
				</div>
				<ThemeSwitcher withLabels />
			</section>

			<SettingsForm />

			<UpdateSettings />

			<DeveloperSettings />

			<footer className="settings-footer">
				<Versions />
				<div>
					<span className="settings-footer__app">Hangar v{version}</span>
				</div>
				<div>
					Разработано{" "}
					<a href="https://github.com/yavabit">yavabit</a>{" "} · {" "}
					Лицензия <a href="https://github.com/yavabit/hangar/blob/master/LICENSE">GNU GPL v3</a>{" "} · {" "}
					<a href="https://github.com/yavabit/hangar">Репозиторий проекта</a>
				</div>
			</footer>
		</div>
	);
};
