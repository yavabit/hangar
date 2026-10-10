import { GitBranchIcon } from '@renderer/shared/assets/icons/git-branch.icon'
import { GitMinusIcon } from '@renderer/shared/assets/icons/git-minus.icon'
import { GitPlusIcon } from '@renderer/shared/assets/icons/git-plus.icon'
import { Tooltip } from 'antd'
import { FC } from 'react'

export const GitStatus: FC<{status: string}> = ({status}) => {
	switch (status) {
		case 'outdated':
			return (
				<Tooltip title="Имеются несинхронизированные изменения"><div><GitMinusIcon color='red'/></div></Tooltip>
			)
		case 'uptodate':
			return (
				<Tooltip title="Актуальная версия"><div><GitBranchIcon color='blue'/></div></Tooltip>
			)
		case 'uncommited':
			return (
				<Tooltip title="Имеются неотправленные изменения"><div><GitPlusIcon color='orange'/></div></Tooltip>
			)
		default:
			return (
				<Tooltip><GitBranchIcon /></Tooltip>
			)
	}
}
