import { FC } from "react";
import { Tooltip } from "@renderer/shared/components/UI/Tooltip/Tooltip";
import type { GitInfo } from "@common/api/api.types";
import { summarizeGit } from "@renderer/shared/utils/gitSummary";

import "./GitBadge.scss";

type GitBadgeProps = {
	/** undefined — ещё не проверено, null — не git-репозиторий */
	git: GitInfo | null | undefined;
};

/** Короткий статус git: что не закоммичено, не отправлено или отстаёт */
export const GitBadge: FC<GitBadgeProps> = ({ git }) => {
	if (git === undefined) {
		return <span className="skeleton" style={{ width: 36, height: 22 }} />;
	}

	if (!git) {
		return null;
	}

	const summary = summarizeGit(git);

	return (
		<Tooltip
			title={
				<div>
					{summary.lines.map((line) => (
						<div key={line}>{line}</div>
					))}
				</div>
			}
		>
			<span className={`git-badge git-badge--${summary.tone}`}>{summary.label}</span>
		</Tooltip>
	);
};
