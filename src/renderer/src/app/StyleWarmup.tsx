import { FC } from "react";
import {
	Alert,
	Button,
	Card,
	Checkbox,
	Divider,
	Dropdown,
	Empty,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Segmented,
	Select,
	Space,
	Spin,
	Switch,
	Tag,
	Tooltip,
	TreeSelect,
	Typography,
} from "antd";

/**
 * Скрытые экземпляры компонентов antd. Antd генерирует CSS компонента при первом показе,
 * и без прогрева первый переход в раздел заметно подтормаживает. Рисуем их во время заставки
 * и не размонтируем: antd удаляет стили, когда последний такой компонент исчезает.
 */
export const StyleWarmup: FC = () => (
	<div aria-hidden="true" style={{ display: "none" }}>
		<Form layout="vertical">
			<Form.Item label="-" tooltip="-" extra="-">
				<Input />
			</Form.Item>
		</Form>
		<Input.TextArea />
		<InputNumber />
		<Select />
		<TreeSelect />
		<Switch />
		<Checkbox />
		<Segmented options={["-"]} />
		<Space.Compact>
			<Button type="primary">-</Button>
		</Space.Compact>
		<Card />
		<Divider />
		<Alert title="-" />
		<Empty />
		<Tag />
		<Spin />
		<Typography.Text>-</Typography.Text>
		<Tooltip title="-">
			<span />
		</Tooltip>
		<Dropdown menu={{ items: [] }}>
			<span />
		</Dropdown>
		<Popconfirm title="-">
			<span />
		</Popconfirm>
		<Modal open={false} />
	</div>
);
