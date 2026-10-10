import { Spin } from 'antd';
import { FC, ReactNode } from 'react'

type LoadingProps = {
	size?: 'small' | 'large';
	description?: ReactNode;
	children?: ReactNode;
	fullscreen?: boolean
}

export const Loading: FC<LoadingProps> = ({size='large', description, children, fullscreen=false}) => {
  return (
	<Spin size={size} description={description} fullscreen={fullscreen}>
		{children}
	</Spin>
  )
}
