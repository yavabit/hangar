import { FC } from "react";
import { Check } from "lucide-react";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import { FOLDER_COLORS, folderColorStyle } from "@renderer/shared/utils/folderColor";

import "./FolderColorPicker.scss";

type FolderColorPickerProps = {
	value?: string;
	onChange?: (value: string | undefined) => void;
	/** Цвет, который будет без своего: у родителя или акцентный */
	inheritedColor?: string;
	inheritedLabel: string;
};

/** Выбор цвета папки из набора. Первый вариант — без своего цвета */
export const FolderColorPicker: FC<FolderColorPickerProps> = ({ value, onChange, inheritedColor, inheritedLabel }) => (
	<div className="folder-color-picker" role="radiogroup" aria-label="Цвет папки">
		<Tooltip title={inheritedLabel}>
			<button
				type="button"
				role="radio"
				aria-checked={!value}
				aria-label={inheritedLabel}
				className={`folder-color-picker__swatch folder-color-picker__swatch--inherit ${!value ? "folder-color-picker__swatch--active" : ""}`}
				style={folderColorStyle(inheritedColor)}
				onClick={() => onChange?.(undefined)}
			>
				{!value && <Check size={13} strokeWidth={3} />}
			</button>
		</Tooltip>
		{FOLDER_COLORS.map((color) => (
			<Tooltip key={color.value} title={color.label}>
				<button
					type="button"
					role="radio"
					aria-checked={value === color.value}
					aria-label={color.label}
					className={`folder-color-picker__swatch ${value === color.value ? "folder-color-picker__swatch--active" : ""}`}
					style={folderColorStyle(color.value)}
					onClick={() => onChange?.(color.value)}
				>
					{value === color.value && <Check size={13} strokeWidth={3} />}
				</button>
			</Tooltip>
		))}
	</div>
);
