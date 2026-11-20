import { FC } from "react";

import { createMemoryRouter, Navigate, RouterProvider } from "react-router-dom";
import { FullLayout } from "../Layout/Layout";
import { Projects } from "@renderer/pages/Projects/Projects";
import { FolderPage } from "@renderer/pages/Folder/FolderPage";
import { Favorites } from "@renderer/pages/Favorites/Favorites";
import { Scripts } from "@renderer/pages/Scripts/Scripts";
import { Settings } from "@renderer/pages/Settings/Settings";
import { RouteError } from "./RouteError";

const errorElement = <RouteError />;

const router = createMemoryRouter([
	{
		element: <FullLayout />,
		errorElement,
		children: [
			{ path: "/", element: <Projects />, errorElement },
			{ path: "/folder/:id", element: <FolderPage />, errorElement },
			{ path: "/fav", element: <Favorites />, errorElement },
			{ path: "/scripts", element: <Scripts />, errorElement },
			{ path: "/settings", element: <Settings />, errorElement },
			{ path: "*", element: <Navigate to="/" replace /> },
		],
	},
]);

export const Router: FC = () => {
	return <RouterProvider router={router} />;
};
