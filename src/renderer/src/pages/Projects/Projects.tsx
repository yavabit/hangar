import { FC, ReactNode, useEffect, useState } from "react";
import { Filters } from "../../shared/components/Filters/Filters";
import { PlusOutlined, HomeOutlined, FolderOutlined } from "@ant-design/icons";
import { Breadcrumb, Button } from "antd";
import { Folders } from "./components/Folders/Folders";
import { ProjectList } from "../../shared/components/Project/ProjectList";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@renderer/store/app.store";
import { AddOrEditProjectModal } from "./components/Modals/AddProjectModal";

export const Projects: FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	
	const { folders, projects, setSelectedFolder } = useAppStore((s) => s);

	const [addModalOpen, setAddModalOpen] = useState(false);

	const handleFiltersChange = () => {

	};


	useEffect(() => {
		if (id) {
			setSelectedFolder(folders.find((f) => f.id === id) || null);
		} else {
			setSelectedFolder(null);
		}
	}, [id, folders, setSelectedFolder, projects]);

	
	const renderTitle = (): ReactNode => {
		if (id && folders.length) {
			const folderName = folders.find((f) => f.id === id)?.name;

			return (
				<Breadcrumb
					items={[
						{
							title: (
								<div className="page-title">
									<HomeOutlined style={{fontSize: 30, marginRight: 10}}/>
									<span style={{ cursor: "pointer" }}>Проекты</span>
								</div>
							),
							onClick: () => navigate("/"),
						},
						{
							title: (
								<div className="page-title">
									<FolderOutlined style={{fontSize: 30, marginRight: 10}}/>
									<span>{folderName}</span>
								</div>
							),
						},
					]}
				/>
			);
		}

		return <div className="page-title">Проекты</div>;
	};

	return (
		<div>
			{renderTitle()}
			<Filters showSwitchProjects={!id} showSwitchFolders={!id} onFiltersChange={handleFiltersChange} />
			<Button
				type="primary"
				size="large"
				icon={<PlusOutlined />}
				onClick={() => setAddModalOpen(true)}
			>
				Добавить проект
			</Button>
			{!id &&
				<>
					<div className="project-list" style={{ marginTop: 20 }}>
						<Folders items={folders}/>
					</div>
					<div className="project-list" style={{ marginTop: 20 }}>
						<ProjectList
							items={projects.filter((p) => !p.folderId)}
							showEmpty={false}
						/>
					</div>
				</>
			}
			{id && 
				<div className="project-list" style={{ marginTop: 20 }}>
					<ProjectList
						items={projects.filter((p) => p.folderId === id)}
					/>
				</div>
			}
			<AddOrEditProjectModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}/>
		</div>
	);
};
