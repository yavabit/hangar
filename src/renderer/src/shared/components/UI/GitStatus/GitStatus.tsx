import { FC } from "react";
import { GitBranchIcon } from "@renderer/shared/assets/icons/git-branch.icon";
import { GitMinusIcon } from "@renderer/shared/assets/icons/git-minus.icon";
import { GitPlusIcon } from "@renderer/shared/assets/icons/git-plus.icon";
import type { Project } from "@schemas/store.schema";
import { toGitWebUrl } from "@renderer/shared/utils/gitUrl";
import { CardAction } from "../CardAction/CardAction";

const GIT_COLOR = "#f05033";

type StatusView = {
	title: string;
	color: string;
	Icon: typeof GitBranchIcon;
};

const statusView: Record<NonNullable<Project["gitStatus"]>, StatusView> = {
	outdated: { title: "Имеются несинхронизированные изменения", color: "#cf1322", Icon: GitMinusIcon },
	uptodate: { title: "Актуальная версия", color: "#1677ff", Icon: GitBranchIcon },
	uncommited: { title: "Имеются неотправленные изменения", color: "#d46b08", Icon: GitPlusIcon },
};

type GitStatusProps = {
	gitUrl?: string;
	status?: Project["gitStatus"];
};

export const GitStatus: FC<GitStatusProps> = ({ gitUrl, status }) => {
	const webUrl = toGitWebUrl(gitUrl);

	if (!webUrl) {
		return (
			<CardAction
				title="Репозиторий не указан. Добавьте ссылку в настройках проекта"
				icon={<GitBranchIcon />}
				disabled
			/>
		);
	}

	const view = status ? statusView[status] : null;
	const Icon = view?.Icon ?? GitBranchIcon;

	return (
		<CardAction
			title={view ? `${view.title}. Открыть репозиторий` : "Открыть репозиторий"}
			icon={<Icon />}
			color={view?.color ?? GIT_COLOR}
			onClick={() => window.open(webUrl, "_blank")}
		/>
	);
};
