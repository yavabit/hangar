import { Search } from "@renderer/shared/components/Search/Search";
import { Flex, Select } from "antd";
import { ClockCircleOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { FC, ReactNode } from "react";
import type { ProjectFiltersValue, ProjectSort } from "@renderer/shared/utils/projectFilters";

type FiltersProps = {
	value: ProjectFiltersValue;
	onChange: (value: ProjectFiltersValue) => void;
	placeholder?: string;
	extra?: ReactNode;
};

const sortOptions: { value: ProjectSort; label: ReactNode }[] = [
	{ value: "recent", label: <span><ClockCircleOutlined /> Недавние</span> },
	{ value: "name", label: <span><SortAscendingOutlined /> По названию</span> },
];

export const Filters: FC<FiltersProps> = ({
	value,
	onChange,
	placeholder = "Поиск по названию, пути или репозиторию...",
	extra,
}) => {
	return (
		<Flex gap={12} align="center" wrap="wrap" style={{ marginBottom: 20 }}>
			<div style={{ flex: 1, minWidth: 280 }}>
				<Search
					value={value.search}
					placeholder={placeholder}
					onChange={(search) => onChange({ ...value, search })}
				/>
			</div>
			{extra}
			<Select
				size="large"
				value={value.sort}
				options={sortOptions}
				onChange={(sort) => onChange({ ...value, sort })}
				style={{ width: 180 }}
				aria-label="Сортировка"
			/>
		</Flex>
	);
};
