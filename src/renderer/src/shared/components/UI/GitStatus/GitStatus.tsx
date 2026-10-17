import { FC } from "react";
import { GitBranch } from "lucide-react";
import type { GitInfo } from "@common/api/api.types";
import { getGitHost, toGitWebUrl } from "@renderer/shared/utils/gitUrl";
import { summarizeGit } from "@renderer/shared/utils/gitSummary";
import { GithubIcon, GitlabIcon } from "@renderer/shared/assets/icons/brand";
import { CardAction } from "../CardAction/CardAction";

type GitStatusProps = {
	gitUrl?: string;
	git?: GitInfo | null;
};

/** Действие карточки: открыть репозиторий в браузере. В подсказке — локальный статус git */
export const GitStatus: FC<GitStatusProps> = ({ gitUrl, git }) => {
	const webUrl = toGitWebUrl(gitUrl);
	const host = getGitHost(gitUrl);
	const icon =
		host === "github" ? <GithubIcon size={15} /> : host === "gitlab" ? <GitlabIcon size={15} /> : <GitBranch size={15} strokeWidth={1.9} />;

	const lines = git ? summarizeGit(git).lines : [];

	return (
		<CardAction
			title={
				<div>
					{lines.map((line) => (
						<div key={line}>{line}</div>
					))}
					<div style={{ opacity: lines.length ? 0.7 : 1, marginTop: lines.length ? 4 : 0 }}>
						{webUrl ? "Открыть репозиторий" : "Ссылка на репозиторий не указана"}
					</div>
				</div>
			}
			icon={icon}
			disabled={!webUrl}
			onClick={() => webUrl && window.open(webUrl, "_blank")}
		/>
	);
};
