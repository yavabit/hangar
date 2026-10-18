import { FC } from "react";
import { Button } from "antd";
import { FolderSearch, Keyboard, Plus, Tag, X } from "lucide-react";
import logo from "@renderer/shared/assets/logo/logo.svg";
import { useAppStore } from "@renderer/store/app.store";
import { formatHotkey } from "@renderer/shared/utils/hotkey";

import "./Onboarding.scss";

type OnboardingProps = {
	onImport: () => void;
	onAdd: () => void;
	onAliases: () => void;
	/** Предпросмотр из режима разработчика: данные есть, экран можно закрыть */
	onClosePreview?: () => void;
};

/** Первый запуск: проектов и папок ещё нет */
export const Onboarding: FC<OnboardingProps> = ({ onImport, onAdd, onAliases, onClosePreview }) => {
	const hotkey = useAppStore((s) => s.settings.common.globalHotkey);

	return (
		<section className="onboarding glass">
			{onClosePreview && (
				<Button className="onboarding__close" type="text" icon={<X size={16} />} onClick={onClosePreview}>
					Закрыть предпросмотр
				</Button>
			)}
			<img src={logo} alt="" className="onboarding__logo" />
			<h2 className="onboarding__title">Добро пожаловать в Hangar</h2>
			<p className="onboarding__text">
				Соберите рабочие и личные проекты в одном месте — дальше любой из них открывается в IDE за пару нажатий.
			</p>

			<div className="onboarding__steps">
				<button type="button" className="onboarding__step onboarding__step--primary" onClick={onImport}>
					<FolderSearch size={20} strokeWidth={1.8} />
					<span className="onboarding__step-title">Импортировать папку</span>
					<span className="onboarding__step-text">Найдём все проекты внутри, например в D:\Dev</span>
				</button>
				<button type="button" className="onboarding__step" onClick={onAdd}>
					<Plus size={20} strokeWidth={1.8} />
					<span className="onboarding__step-title">Добавить вручную</span>
					<span className="onboarding__step-text">Один проект: путь, папка, ссылка на задачу</span>
				</button>
				<button type="button" className="onboarding__step" onClick={onAliases}>
					<Tag size={20} strokeWidth={1.8} />
					<span className="onboarding__step-title">Настроить алиасы</span>
					<span className="onboarding__step-text">Короткие пути вроде @work вместо длинных</span>
				</button>
			</div>

			{hotkey && (
				<div className="onboarding__hint">
					<Keyboard size={14} />
					Поиск проекта из любого приложения — <kbd>{formatHotkey(hotkey)}</kbd>
				</div>
			)}
		</section>
	);
};
