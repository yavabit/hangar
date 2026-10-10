import { Project } from "@schemas/store.schema";

export const sampleProjects: Project[] = [
	{
		id: "1",
		name: "Website Redesign",
		path: "/home/user/projects/website-redesign",
		isFavorite: false,
		lastOpened: new Date(
			Date.now() - 2 * 60 * 60 * 1000
		).toISOString(),
		gitStatus: "uncommited",
	},
	{
		id: "2",
		name: "Mobile App",
		path: "/home/user/projects/mobile-app",
		isFavorite: false,
		lastOpened: new Date(
			Date.now() - 24 * 60 * 60 * 1000
		).toISOString(),
		gitStatus: "uptodate",
	},
	{
		id: "3",
		name: "Analytics Dashboard",
		path: "/home/user/projects/analytics-dashboard",
		isFavorite: false,
		lastOpened: new Date(
			Date.now() - 48 * 60 * 60 * 1000
		).toISOString(),
		gitStatus: "outdated",
	},
	{
		id: "4",
		name: "E-commerce Platform",
		path: "/home/user/projects/ecommerce",
		isFavorite: false,
		lastOpened: new Date(
			Date.now() - 7 * 24 * 60 * 60 * 1000
		).toISOString(),
		gitStatus: "uptodate",
	},
];