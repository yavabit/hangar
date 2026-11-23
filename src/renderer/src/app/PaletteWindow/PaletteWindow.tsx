import { FC, useEffect, useState } from "react";
import { useAppStore } from "@renderer/store/app.store";
import { PaletteView } from "@renderer/shared/components/CommandPalette/PaletteView";
import { useAppSync } from "../useAppSync";

import "./PaletteWindow.scss";

/**
 * Отдельное окно быстрого поиска для глобального сочетания клавиш.
 * После скрытия содержимое сбрасывается, чтобы следующий показ не перерисовывал окно.
 */
export const PaletteWindow: FC = () => {
	const hydrated = useAppStore((s) => s.hydrated);
	const [session, setSession] = useState(0);

	useAppSync();

	useEffect(() => window.api.app.onPaletteHidden(() => setSession((value) => value + 1)), []);

	const hide = (): void => {
		void window.api.app.hidePalette();
	};

	return (
		<div
			className="palette-window"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) {
					hide();
				}
			}}
		>
			<div className="palette-window__panel">
				{hydrated && (
					<PaletteView
						key={session}
						standalone
						onNavigate={(route) => void window.api.app.openInMain(route)}
						onClose={hide}
					/>
				)}
			</div>
		</div>
	);
};
