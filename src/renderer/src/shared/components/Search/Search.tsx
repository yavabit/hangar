import { FC, ReactNode } from "react";
import { Input, Tag, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import "./Search.scss";

export type SearchScopeTag = {
	label: ReactNode;
	icon?: ReactNode;
	/** Тег удалили крестиком или Backspace в пустом поле */
	onRemove: () => void;
};

type SearchProps = {
	value?: string;
	placeholder?: string;
	onChange?: (value: string) => void;
	/** Тег области поиска, например текущей папки */
	scopeTag?: SearchScopeTag;
}

export const Search: FC<SearchProps> = ({ value, placeholder = 'Поиск...', onChange, scopeTag }) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (scopeTag && e.key === "Backspace" && !e.currentTarget.value) {
			scopeTag.onRemove();
		}
	};

	return (
		<Input
			placeholder={placeholder}
			prefix={
				<span className="search__prefix">
					<SearchOutlined style={{ color: '#bfbfbf' }} />
					{scopeTag && (
						<Tooltip title="Ищем только здесь. Уберите тег, чтобы искать по всем проектам">
							<Tag
								closable
								icon={scopeTag.icon}
								color="processing"
								bordered={false}
								className="search__scope-tag"
								onClose={(e) => {
									e.preventDefault();
									scopeTag.onRemove();
								}}
							>
								{scopeTag.label}
							</Tag>
						</Tooltip>
					)}
				</span>
			}
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
			onKeyDown={handleKeyDown}
			allowClear
			size="large"
			style={{ backgroundColor: '#f8f8f8' }}
		/>
	);
};
