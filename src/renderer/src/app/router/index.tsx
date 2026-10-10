import { FC } from "react";

import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { FullLayout } from "../Layout/Layout";
import { Projects } from "@renderer/pages/Projects/Projects";
import { FolderPage } from "@renderer/pages/Folder/FolderPage";
import { Favorites } from "@renderer/pages/Favorites/Favorites";
import { Scripts } from "@renderer/pages/Scripts/Scripts";
import { Settings } from "@renderer/pages/Settings/Settings";

export const Router: FC = () => {
	return (
		<MemoryRouter>
			<FullLayout>
				<Routes>
					<Route path="/" element={<Projects />} />
					<Route path="/folder/:id" element={<FolderPage />} />
					<Route path="/fav" element={<Favorites />} />
					<Route path="/scripts" element={<Scripts />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</FullLayout>
		</MemoryRouter>
	);
};
