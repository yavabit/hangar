import { FC, useEffect, useState } from "react";
import { useAppStore } from "@renderer/store/app.store";
import { PaletteView } from "@renderer/shared/components/CommandPalette/PaletteView";
import { useAppSync } from "../useAppSync";

import "./PaletteWindow.scss";

/**
 * Отдельное окно быстрого поиска для глобального сочетания клавиш.
 * При каждом показе содержимое пересоздаётся: пустой запрос и фокус в поле ввода.
 */
export const PaletteWindow: FC = () => {
	const hydrated = useAppStore((s) => s.hydrated);
	const [session, setSession] = useState(0);

	useAppSync();

	useEffect(() => window.api.app.onPaletteShown(() => setSession((value) => value + 1)), []);

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
						onNavigate={(route) => void window.api.app.openInMain(route)}
						onClose={hide}
					/>
				)}
			</div>
		</div>
	);
};
