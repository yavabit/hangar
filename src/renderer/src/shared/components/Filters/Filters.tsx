import { Search, type SearchScopeTag } from "@renderer/shared/components/Search/Search";
import { Segmented, Select } from "antd";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import { ArrowDownAZ, Clock, LayoutGrid, List, SquareArrowOutUpRight } from "lucide-react";
import { FC, ReactNode } from "react";
import type { ProjectFiltersValue, ProjectSort } from "@renderer/shared/utils/projectFilters";
import { useUiStore, type ProjectsLayout } from "@renderer/store/ui.store";

import "./Filters.scss";

type FiltersProps = {
	value: ProjectFiltersValue;
	onChange: (value: ProjectFiltersValue) => void;
	placeholder?: string;
	extra?: ReactNode;
	scopeTag?: SearchScopeTag;
};

const sortOptions: { value: ProjectSort; label: ReactNode }[] = [
	{ value: "opened", label: <span className="filters__option"><SquareArrowOutUpRight size={14} /> Недавно открытые</span> },
	{ value: "modified", label: <span className="filters__option"><Clock size={14} /> Недавно изменённые</span> },
	{ value: "name", label: <span className="filters__option"><ArrowDownAZ size={14} /> По названию</span> },
];

export const Filters: FC<FiltersProps> = ({
	value,
	onChange,
	placeholder = "Поиск по названию, описанию, пути или репозиторию...",
	extra,
	scopeTag,
}) => {
	const layout = useUiStore((s) => s.layout);
	const setLayout = useUiStore((s) => s.setLayout);

	return (
		<div className="filters">
			<div className="filters__search">
				<Search
					value={value.search}
					placeholder={placeholder}
					scopeTag={scopeTag}
					onChange={(search) => onChange({ ...value, search })}
				/>
			</div>
			{extra}
			<Segmented<ProjectsLayout>
				size="large"
				value={layout}
				onChange={setLayout}
				options={[
					{ value: "grid", label: <Tooltip title="Карточки"><span className="filters__icon"><LayoutGrid size={16} /></span></Tooltip> },
					{ value: "list", label: <Tooltip title="Список"><span className="filters__icon"><List size={16} /></span></Tooltip> },
				]}
			/>
			<Select
				size="large"
				value={value.sort}
				options={sortOptions}
				onChange={(sort) => onChange({ ...value, sort })}
				style={{ width: 220 }}
				aria-label="Сортировка"
			/>
		</div>
	);
};
