import { FC } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

type SearchProps = {
	value?: string;
	placeholder?: string;
	onChange?: (value: string) => void;
}

export const Search: FC<SearchProps> = ({ value, placeholder = 'Поиск...', onChange }) => {
	return (
		<Input
			placeholder={placeholder}
			prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
			allowClear
			size="large"
			style={{ backgroundColor: '#f8f8f8' }}
		/>
	);
};
