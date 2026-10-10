import { ChangeEventHandler, FC, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

type SearchProps = {
	placeholder?: string;
	onChange?: (value: string) => void;
}

export const Search: FC<SearchProps> = ({placeholder = 'Поиск...', onChange}) => {
	const [value, setValue] = useState('');

  const handleChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement> | undefined = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange &&onChange(newValue);
  };

	return (
		<Input
			placeholder={placeholder}
			prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
			value={value}
			onChange={handleChange}
			allowClear
			size="large"
			style={{ marginBottom: 16, backgroundColor: '#f8f8f8' }}
		/>
	);
};
