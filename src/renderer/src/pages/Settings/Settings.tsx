import { FC } from "react";
import { Palette, ShieldCheck } from "lucide-react";
import { Versions } from "@renderer/shared/components/Versions";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";
import { ThemeSwitcher } from "@renderer/shared/components/ThemeSwitcher/ThemeSwitcher";
import { SettingsForm } from "./SettingsForm/SettingsForm";

import "./Settings.scss";

export const Settings: FC = () => {
	return (
		<div className="settings-page">
			<PageHeader title="Настройки" description="Оформление, IDE, консоль, алиасы путей и быстрый доступ" />

			<section className="settings-card glass">
				<div className="settings-card__head">
					<Palette size={18} strokeWidth={1.8} />
					<div>
						<div className="settings-card__title">Оформление</div>
						<div className="settings-card__text">Тема применяется сразу, без сохранения</div>
					</div>
				</div>
				<ThemeSwitcher withLabels />
			</section>

			<SettingsForm />

			<section className="settings-note">
				<ShieldCheck size={16} strokeWidth={1.8} />
				<span>Hangar ничего не отправляет в интернет: проекты и настройки хранятся только на этом устройстве.</span>
			</section>

			<footer className="settings-footer">
				<Versions />
				<div>
					Платформа: {window.electron.process.platform} · Разработано <a href="https://github.com/yavabit">yavabit</a>
				</div>
			</footer>
		</div>
	);
};
