import { FC, ReactNode } from "react";
import { Badge } from "antd";
import { GitBranchIcon } from "@renderer/shared/assets/icons/git-branch.icon";
import { GitMinusIcon } from "@renderer/shared/assets/icons/git-minus.icon";
import { GitPlusIcon } from "@renderer/shared/assets/icons/git-plus.icon";
import type { GitInfo } from "@common/api/api.types";
import { toGitWebUrl } from "@renderer/shared/utils/gitUrl";
import { pluralize } from "@renderer/shared/utils/pluralize";
import { CardAction } from "../CardAction/CardAction";

const COLORS = {
	clean: "#389e0d",
	changes: "#d46b08",
	ahead: "#722ed1",
	behind: "#cf1322",
	link: "#f05033",
};

type GitView = {
	color: string;
	icon: ReactNode;
	count: number;
	lines: string[];
};

const describe = (git: GitInfo): GitView => {
	const lines = [git.branch ? `Ветка: ${git.branch}` : "Detached HEAD"];

	if (git.changes) {
		lines.push(`${git.changes} ${pluralize(git.changes, ["изменённый файл", "изменённых файла", "изменённых файлов"])}`);
	}
	if (git.ahead) {
		lines.push(`${git.ahead} ${pluralize(git.ahead, ["коммит не отправлен", "коммита не отправлены", "коммитов не отправлено"])}`);
	}
	if (git.behind) {
		lines.push(`Отстаёт на ${git.behind} ${pluralize(git.behind, ["коммит", "коммита", "коммитов"])} (по последнему fetch)`);
	}
	if (!git.changes && !git.ahead && !git.behind) {
		lines.push(git.hasUpstream ? "Всё закоммичено и отправлено" : "Всё закоммичено, ветка не связана с сервером");
	}

	if (git.behind) {
		return { color: COLORS.behind, icon: <GitMinusIcon />, count: git.behind, lines };
	}
	if (git.changes) {
		return { color: COLORS.changes, icon: <GitPlusIcon />, count: git.changes, lines };
	}
	if (git.ahead) {
		return { color: COLORS.ahead, icon: <GitPlusIcon />, count: git.ahead, lines };
	}
	return { color: COLORS.clean, icon: <GitBranchIcon />, count: 0, lines };
};

type GitStatusProps = {
	gitUrl?: string;
	/** undefined — статус ещё не проверен, null — не git-репозиторий */
	git?: GitInfo | null;
};

/** Действие карточки: локальный статус git и переход в репозиторий */
export const GitStatus: FC<GitStatusProps> = ({ gitUrl, git }) => {
	const webUrl = toGitWebUrl(gitUrl);
	const openRepo = webUrl ? (): void => void window.open(webUrl, "_blank") : undefined;

	if (!git) {
		const title = webUrl
			? "Открыть репозиторий"
			: git === null
				? "Не git-репозиторий, ссылка не указана"
				: "Репозиторий не указан. Добавьте ссылку в настройках проекта";

		return (
			<CardAction
				title={title}
				icon={<GitBranchIcon />}
				color={COLORS.link}
				disabled={!webUrl}
				onClick={openRepo}
			/>
		);
	}

	const view = describe(git);

	return (
		<CardAction
			title={
				<div>
					{view.lines.map((line) => (
						<div key={line}>{line}</div>
					))}
					{webUrl && <div style={{ opacity: 0.7, marginTop: 4 }}>Нажмите, чтобы открыть репозиторий</div>}
				</div>
			}
			icon={
				<Badge count={view.count} size="small" color={view.color} offset={[4, -2]} overflowCount={99}>
					<span style={{ color: view.color, display: "inline-flex" }}>{view.icon}</span>
				</Badge>
			}
			color={view.color}
			inactive={!webUrl}
			onClick={openRepo}
		/>
	);
};
