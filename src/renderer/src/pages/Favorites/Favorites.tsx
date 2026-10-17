import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { LayoutGrid, Plus, Star } from "lucide-react";
import { ProjectList } from "@renderer/shared/components/Project/ProjectList";
import { Filters } from "@renderer/shared/components/Filters/Filters";
import { ProjectModal } from "@renderer/shared/components/Modals/ProjectModal";
import { PageHeader } from "@renderer/shared/components/PageHeader/PageHeader";
import { RefreshStatusButton } from "@renderer/shared/components/RefreshStatusButton/RefreshStatusButton";
import { useAppStore } from "@renderer/store/app.store";
import { usePageFilters } from "@renderer/store/ui.store";
import { usePathAliases } from "@renderer/shared/hooks/usePathAliases";
import { applyProjectFilters } from "@renderer/shared/utils/projectFilters";
import { pluralize } from "@renderer/shared/utils/pluralize";

export const Favorites: FC = () => {
	const navigate = useNavigate();
	const projects = useAppStore((s) => s.projects);

	const { filters, setFilters } = usePageFilters("favorites");
	const { resolvePath } = usePathAliases();
	const [addModalOpen, setAddModalOpen] = useState(false);

	const favorites = useMemo(() => projects.filter((p) => p.isFavorite), [projects]);
	const visibleProjects = useMemo(
		() => applyProjectFilters(favorites, filters, resolvePath),
		[favorites, filters, resolvePath],
	);

	const getEmptyState = (): { description: React.ReactNode; extra?: React.ReactNode } => {
		if (favorites.length > 0) {
			return { description: `Ничего не найдено по запросу «${filters.search.trim()}»` };
		}

		return {
			description: (
				<div>
					<div>В избранном пока пусто</div>
					<Typography.Text type="secondary" style={{ fontSize: 14 }}>
						Нажмите <Star size={13} style={{ verticalAlign: -2 }} /> рядом с названием проекта, чтобы закрепить его здесь
					</Typography.Text>
				</div>
			),
			extra: (
				<Button icon={<LayoutGrid size={15} />} onClick={() => navigate("/")}>
					Перейти к проектам
				</Button>
			),
		};
	};

	const empty = getEmptyState();

	return (
		<div>
			<PageHeader
				title="Избранное"
				description={`${favorites.length} ${pluralize(favorites.length, ["проект", "проекта", "проектов"])} под рукой`}
				extra={
					<>
						<RefreshStatusButton />
						<Button type="primary" icon={<Plus size={16} strokeWidth={2.2} />} onClick={() => setAddModalOpen(true)}>
							Новый проект
						</Button>
					</>
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
