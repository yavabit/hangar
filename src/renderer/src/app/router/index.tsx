import { FC } from "react";

import { createMemoryRouter, Navigate, RouterProvider } from "react-router-dom";
import { FullLayout } from "../Layout/Layout";
import { Projects } from "@renderer/pages/Projects/Projects";
import { FolderPage } from "@renderer/pages/Folder/FolderPage";
import { Favorites } from "@renderer/pages/Favorites/Favorites";
import { Scripts } from "@renderer/pages/Scripts/Scripts";
import { Settings } from "@renderer/pages/Settings/Settings";

const router = createMemoryRouter([
	{
		element: <FullLayout />,
		children: [
			{ path: "/", element: <Projects /> },
			{ path: "/folder/:id", element: <FolderPage /> },
			{ path: "/fav", element: <Favorites /> },
			{ path: "/scripts", element: <Scripts /> },
			{ path: "/settings", element: <Settings /> },
			{ path: "*", element: <Navigate to="/" replace /> },
		],
	},
]);

export const Router: FC = () => {
	return <RouterProvider router={router} />;
};
