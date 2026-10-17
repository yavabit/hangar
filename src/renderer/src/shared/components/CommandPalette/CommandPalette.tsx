import { FC, useEffect } from "react";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@renderer/store/ui.store";
import { PaletteView } from "./PaletteView";

/** Быстрый поиск внутри главного окна: Ctrl+K или кнопка в шапке */
export const CommandPalette: FC = () => {
	const navigate = useNavigate();
	const open = useUiStore((s) => s.paletteOpen);
	const setOpen = useUiStore((s) => s.setPaletteOpen);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent): void => {
			if ((e.ctrlKey || e.metaKey) && e.code === "KeyK" && !e.repeat) {
				e.preventDefault();
				setOpen(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [setOpen]);

	return (
		<Modal
			open={open}
			onCancel={() => setOpen(false)}
			footer={null}
			closable={false}
			keyboard={false}
			width={720}
			style={{ top: 80 }}
			styles={{ container: { padding: 0, overflow: "hidden" } }}
			className="command-palette-modal"
			destroyOnHidden
		>
			<PaletteView onNavigate={navigate} onClose={() => setOpen(false)} />
		</Modal>
	);
};
