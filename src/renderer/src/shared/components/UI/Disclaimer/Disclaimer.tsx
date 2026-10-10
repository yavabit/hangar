import { FC, ReactNode } from "react";
import { Card, Space, Typography } from "antd";
import { SafetyOutlined, WarningOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

type DisclaimerProps = {
	title: ReactNode;
	description: ReactNode;
	variant?: "warn" | "info";
}

export const Disclaimer: FC<DisclaimerProps> = ({variant="info", title, description}) => {

	const variantColor = variant === "warn" ? "#ff4d4f" : "#0052cc";

	const icon = variant === "warn" ? <WarningOutlined style={{ fontSize: 20, color: variantColor, marginTop: 4 }}/> : <SafetyOutlined style={{ fontSize: 20, color: variantColor, marginTop: 4 }}/>

	return (
		<Card
			style={{
				marginBottom: 24,
				backgroundColor: "#f8f9fa",
				borderLeft: `4px solid ${variantColor}`,
				maxWidth: 1000,
				margin: "24px auto",
				marginTop: 0,
			}}
			styles={{
				body: {
					padding: "16px 20px",
				},
			}}
		>
			<Space align="start">
				{icon}
				<div style={{ flex: 1 }}>
					<Text strong style={{ fontSize: 14, color: variantColor }}>
						{title}
					</Text>
					<Paragraph
						style={{ marginBottom: 0, marginTop: 8, color: "#5e6c84" }}
					>
						{description}
					</Paragraph>
				</div>
			</Space>
		</Card>
	);
};
