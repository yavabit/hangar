import { FC } from "react";

import { MemoryRouter, Route, Routes } from "react-router-dom";
import { FullLayout } from "../Layout/Layout";
import { Projects } from "@renderer/pages/Projects/Projects";
import { Favorites } from "@renderer/pages/Favorites/Favorites";
import { Settings } from "@renderer/pages/Settings/Settings";

export const Router: FC = () => {
	return (
		<MemoryRouter>
			<FullLayout>
				<Routes>
					<Route path="/" element={<Projects />} />
					<Route path="/folder/:id" element={<Projects />} />
					<Route path="/fav" element={<Favorites />} />
					<Route path="/settings" element={<Settings />} />
				</Routes>
			</FullLayout>
		</MemoryRouter>
	);
};
