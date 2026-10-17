import { Search, type SearchScopeTag } from "@renderer/shared/components/Search/Search";
import { Flex, Select } from "antd";
import { ClockCircleOutlined, ExportOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { FC, ReactNode } from "react";
import type { ProjectFiltersValue, ProjectSort } from "@renderer/shared/utils/projectFilters";

type FiltersProps = {
	value: ProjectFiltersValue;
	onChange: (value: ProjectFiltersValue) => void;
	placeholder?: string;
	extra?: ReactNode;
	scopeTag?: SearchScopeTag;
};

const sortOptions: { value: ProjectSort; label: ReactNode }[] = [
	{ value: "opened", label: <span><ExportOutlined /> Недавно открытые</span> },
	{ value: "modified", label: <span><ClockCircleOutlined /> Недавно изменённые</span> },
	{ value: "name", label: <span><SortAscendingOutlined /> По названию</span> },
];

export const Filters: FC<FiltersProps> = ({
	value,
	onChange,
	placeholder = "Поиск по названию, пути или репозиторию...",
	extra,
	scopeTag,
}) => {
	return (
		<Flex gap={12} align="center" wrap="wrap" style={{ marginBottom: 20 }}>
			<div style={{ flex: 1, minWidth: 280 }}>
				<Search
					value={value.search}
					placeholder={placeholder}
					scopeTag={scopeTag}
					onChange={(search) => onChange({ ...value, search })}
				/>
			</div>
			{extra}
			<Select
				size="large"
				value={value.sort}
				options={sortOptions}
				onChange={(sort) => onChange({ ...value, sort })}
				style={{ width: 230 }}
				aria-label="Сортировка"
			/>
		</Flex>
	);
};
