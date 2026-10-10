import { FC } from "react";
import { Versions } from "@renderer/shared/components/Versions";
import { Disclaimer } from "@renderer/shared/components/UI/Disclaimer/Disclaimer";
import { SettingsForm } from "./SettingsForm/SettingsForm";

export const Settings: FC = () => {

	return (
		<div>
			<Disclaimer 
				variant="info"
				title="Примечание: Конфиденциальность данных" 
				description="В настоящий момент приложение не собирает и не хранит ваши данные на стороне
					какого-либо сервера. Вся информация обрабатывается и сохраняется
					исключительно на вашем устройстве. После закрытия все временные
					данные будут удалены. Настройки и прочие данные будут сохранены на устройстве."
			/>
			<SettingsForm />
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					flexDirection: "column",
					marginTop: "20px",
					marginBottom: "20px",
				}}
			>
				<div
					style={{
						textAlign: "center",
						marginBottom: "10px",
						color: "#056279",
					}}
				>
					Platform: {window.electron.process.platform}
				</div>
				<Versions />
				<div style={{ textAlign: "center", marginTop: "10px", color: "gray" }}>
					Developed by <a href="https://github.com/yavabit">yavabit</a>. Open
					source lic.
				</div>
			</div>
		</div>
	);
};
