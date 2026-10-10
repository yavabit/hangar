import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { AppstoreOutlined, PlusOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { ProjectList } from "@renderer/shared/components/Project/ProjectList";
import { Filters } from "@renderer/shared/components/Filters/Filters";
import { ProjectModal } from "@renderer/shared/components/Modals/ProjectModal";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";
import { useAppStore } from "@renderer/store/app.store";
import {
	applyProjectFilters,
	DEFAULT_PROJECT_FILTERS,
	type ProjectFiltersValue,
} from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";

export const Favorites: FC = () => {
	const navigate = useNavigate();
	const projects = useAppStore((s) => s.projects);

	const [filters, setFilters] = useState<ProjectFiltersValue>(DEFAULT_PROJECT_FILTERS);
	const [addModalOpen, setAddModalOpen] = useState(false);

	const favorites = useMemo(() => projects.filter((p) => p.isFavorite), [projects]);
	const visibleProjects = useMemo(() => applyProjectFilters(favorites, filters), [favorites, filters]);

	const getEmptyState = (): { description: React.ReactNode; extra?: React.ReactNode } => {
		if (favorites.length > 0) {
			return { description: `Ничего не найдено по запросу «${filters.search.trim()}»` };
		}

		return {
			description: (
				<div>
					<div>В избранном пока пусто</div>
					<Typography.Text type="secondary" style={{ fontSize: 14 }}>
						Нажмите <StarOutlined /> рядом с названием проекта, чтобы закрепить его здесь
					</Typography.Text>
				</div>
			),
			extra: (
				<Button icon={<AppstoreOutlined />} onClick={() => navigate("/")}>
					Перейти к проектам
				</Button>
			),
		};
	};

	const empty = getEmptyState();

	return (
		<div>
			<PageHeader
				icon={<StarFilled />}
				title="Избранное"
				description={`${favorites.length} ${pluralize(favorites.length, ["проект", "проекта", "проектов"])} под рукой`}
				extra={
					<Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
						Новый проект
					</Button>
				}
			/>
			<Filters value={filters} onChange={setFilters} />
			<ProjectList
				items={visibleProjects}
				showFolder
				emptyDescription={empty.description}
				emptyExtra={empty.extra}
			/>
			<ProjectModal
				isOpen={addModalOpen}
				defaults={{ isFavorite: true }}
				onClose={() => setAddModalOpen(false)}
			/>
		</div>
	);
};
