import type { GitInfo } from "@common/api/api.types";
import { pluralize } from "./pluralize";

export type GitTone = "behind" | "changes" | "ahead" | "clean";

export type GitSummary = {
	tone: GitTone;
	/** Короткая метка для карточки: «↑ 2», «● 3», «✓» */
	label: string;
	/** Подробности для подсказки */
	lines: string[];
};

/** Описание локального состояния репозитория для интерфейса */
export const summarizeGit = (git: GitInfo): GitSummary => {
	const lines = [git.branch ? `Ветка ${git.branch}` : "Detached HEAD"];

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
		return { tone: "behind", label: `↓ ${git.behind}`, lines };
	}
	if (git.changes) {
		return { tone: "changes", label: `● ${git.changes}`, lines };
	}
	if (git.ahead) {
		return { tone: "ahead", label: `↑ ${git.ahead}`, lines };
	}
	return { tone: "clean", label: "✓", lines };
};
