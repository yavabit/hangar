import { FC } from "react";
import { Col, Empty, Row } from "antd";
import { Project } from "./Project";
import { Project as ProjectType } from "@schemas/store.schema";
import empty from "@shared/assets/icons/empty-folder.png";
import { useProjects } from "@renderer/shared/hooks/useProjects";

type ProjectListProps = {
	items: ProjectType[];
	showEmpty?: boolean
}

export const ProjectList: FC<ProjectListProps> = ({items = [], showEmpty = true}) => {

	const { removeProject, updateProject, openProjectFolder, openProjectInIde } = useProjects()

	return (
		<div>
			{	!items || items.length === 0
				? showEmpty &&<Empty image={empty} description="Проектов не найдено" styles={{ image: { height: 200 }, description: {fontSize: 30} }}></Empty>
				: <Row gutter={[16, 16]}> {/* 16px отступы между колонками по горизонтали и вертикали */}
					{items.map((project) => (
						<Col
							key={project.id}
							xs={24} // 1 элемент в строку
							sm={12} //2 элемента в строку
							md={8} // 3 элемента в строку
							lg={6} // 4 элемента в строку
							xl={4} // 5-6 элементов в строку
							style={{ minWidth: 350 }}
						>
							<Project 
								item={project} 
								onDelete={removeProject} 
								onFavorite={() => updateProject(project.id, {isFavorite: !project.isFavorite})}
							handleOpenFolder={openProjectFolder}
							handleOpenIde={openProjectInIde}
							/>
						</Col>
					))}
				</Row>
			}			
		</div>
	);
};
