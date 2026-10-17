import { FC, useState } from "react";
import { Dropdown, Modal, Spin, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { Check, ChevronDown, Cloud, GitBranch, LoaderCircle } from "lucide-react";
import { gitApi } from "@renderer/shared/api/git.api";
import { useAppNotification } from "@renderer/shared/hooks/useAppNotification";
import { getIpcErrorMessage } from "@renderer/shared/utils/ipcError";
import { pluralize } from "@renderer/shared/utils/pluralize";
import type { GitBranches } from "@common/api/api.types";

import "./BranchSwitcher.scss";

type BranchSwitcherProps = {
	projectId: string;
	branch: string | null;
	/** Незакоммиченные изменения: перед переключением о них предупреждаем */
	changes: number;
};

const LOCAL_PREFIX = "local:";
const REMOTE_PREFIX = "remote:";

const stop = (e: React.MouseEvent): void => e.stopPropagation();

/** Текущая ветка проекта с выпадающим списком для переключения */
export const BranchSwitcher: FC<BranchSwitcherProps> = ({ projectId, branch, changes }) => {
	const [branches, setBranches] = useState<GitBranches | null>(null);
	const [loading, setLoading] = useState(false);
	const [switching, setSwitching] = useState(false);
	const [modal, modalContextHolder] = Modal.useModal();
	const { showSuccess, showError } = useAppNotification();

	const loadBranches = async (): Promise<void> => {
		setLoading(true);
		try {
			setBranches(await gitApi.branches(projectId));
		} catch (e) {
			showError("git_branches", { message: "Не удалось получить ветки", description: getIpcErrorMessage(e) });
		} finally {
			setLoading(false);
		}
	};

	const switchTo = async (target: string): Promise<void> => {
		setSwitching(true);
		try {
			await gitApi.switchBranch(projectId, target);
			showSuccess("git_switch", { message: "Ветка переключена", description: target, duration: 2 });
		} catch (e) {
			showError("git_switch", { message: "Не удалось переключить ветку", description: getIpcErrorMessage(e), duration: 8 });
		} finally {
			setSwitching(false);
		}
	};

	const handleSelect: MenuProps["onClick"] = ({ key, domEvent }) => {
		domEvent.stopPropagation();
		const target = key.replace(LOCAL_PREFIX, "").replace(REMOTE_PREFIX, "");

		if (!changes) {
			void switchTo(target);
			return;
		}

		modal.confirm({
			title: `Переключиться на ${target}?`,
			content: `В проекте ${changes} ${pluralize(changes, ["незакоммиченное изменение", "незакоммиченных изменения", "незакоммиченных изменений"])}. Git перенесёт их на другую ветку, если они не конфликтуют, иначе переключение не выполнится.`,
			okText: "Переключить",
			cancelText: "Отмена",
			onOk: () => switchTo(target),
		});
	};

	const items: MenuProps["items"] = loading || !branches
		? [{ key: "loading", disabled: true, label: <Spin size="small" />, }]
		: [
			{
				type: "group",
				label: "Локальные",
				children: branches.local.map((name) => ({
					key: `${LOCAL_PREFIX}${name}`,
					label: name,
					icon: name === branches.current ? <Check size={14} /> : <span className="branch-switcher__no-icon" />,
					disabled: name === branches.current,
				})),
			},
			...(branches.remote.length
				? [
					{
						type: "group" as const,
						label: "На сервере (по последнему fetch)",
						children: branches.remote.map((name) => ({
							key: `${REMOTE_PREFIX}${name}`,
							label: name,
							icon: <Cloud size={14} />,
						})),
					},
				]
				: []),
		];

	return (
		<>
			{modalContextHolder}
			<Dropdown
				trigger={["click"]}
				onOpenChange={(open) => open && void loadBranches()}
				menu={{ items, onClick: handleSelect, className: "branch-switcher__menu" }}
				disabled={switching}
			>
				<Tooltip title="Текущая ветка. Нажмите, чтобы переключить">
					<span className="branch-switcher" onClick={stop} onDoubleClick={stop}>
						{switching ? <LoaderCircle size={12} className="branch-switcher__spin" /> : <GitBranch size={12} strokeWidth={2} />}
						<span className="branch-switcher__name">{branch ?? "detached HEAD"}</span>
						<ChevronDown size={11} className="branch-switcher__arrow" />
					</span>
				</Tooltip>
			</Dropdown>
		</>
	);
};
