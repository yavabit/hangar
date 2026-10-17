import { FC, useState } from "react";
import { Button, Input, Space, Tooltip } from "antd";
import { X } from "lucide-react";
import { formatHotkey } from "@renderer/shared/utils/hotkey";

type HotkeyInputProps = {
	/** Сочетание в формате Electron Accelerator: "CommandOrControl+Shift+Space" */
	value?: string;
	onChange?: (value: string) => void;
};

const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta", "AltGraph"]);

/** Клавиша из события в имя для Electron Accelerator */
const toAcceleratorKey = (e: React.KeyboardEvent): string | null => {
	const { code, key } = e;

	if (code.startsWith("Key")) return code.slice(3);
	if (code.startsWith("Digit")) return code.slice(5);
	if (/^F\d{1,2}$/.test(code)) return code;
	if (code.startsWith("Numpad") && /\d$/.test(code)) return `num${code.slice(-1)}`;

	const named: Record<string, string> = {
		Space: "Space",
		Enter: "Enter",
		Tab: "Tab",
		Backquote: "`",
		Minus: "-",
		Equal: "=",
		BracketLeft: "[",
		BracketRight: "]",
		Backslash: "\\",
		Semicolon: ";",
		Quote: "'",
		Comma: ",",
		Period: ".",
		Slash: "/",
		ArrowUp: "Up",
		ArrowDown: "Down",
		ArrowLeft: "Left",
		ArrowRight: "Right",
		Home: "Home",
		End: "End",
		PageUp: "PageUp",
		PageDown: "PageDown",
		Insert: "Insert",
		Delete: "Delete",
	};

	return named[code] ?? (key.length === 1 ? key.toUpperCase() : null);
};

/** Поле, которое записывает нажатое сочетание клавиш */
export const HotkeyInput: FC<HotkeyInputProps> = ({ value = "", onChange }) => {
	const [recording, setRecording] = useState(false);

	const handleKeyDown = (e: React.KeyboardEvent): void => {
		e.preventDefault();

		if (e.key === "Escape") {
			(e.target as HTMLInputElement).blur();
			return;
		}

		if (MODIFIER_KEYS.has(e.key)) {
			return;
		}

		const key = toAcceleratorKey(e);
		const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
		if (!key || !hasModifier) {
			return;
		}

		const parts = [
			e.ctrlKey || e.metaKey ? "CommandOrControl" : null,
			e.altKey ? "Alt" : null,
			e.shiftKey ? "Shift" : null,
			key,
		].filter(Boolean);

		onChange?.(parts.join("+"));
		(e.target as HTMLInputElement).blur();
	};

	return (
		<Space.Compact style={{ width: 360 }}>
			<Input
				readOnly
				value={recording ? "Нажмите сочетание клавиш…" : value ? formatHotkey(value) : ""}
				placeholder="Не назначено"
				onFocus={() => setRecording(true)}
				onBlur={() => setRecording(false)}
				onKeyDown={handleKeyDown}
				style={{ cursor: "pointer", fontWeight: value && !recording ? 600 : undefined }}
			/>
			<Tooltip title="Отключить">
				<Button icon={<X size={15} />} disabled={!value} onClick={() => onChange?.("")} />
			</Tooltip>
		</Space.Compact>
	);
};
