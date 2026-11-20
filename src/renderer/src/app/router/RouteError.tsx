import { FC } from "react";
import { Button, Space } from "antd";
import { ArrowLeft, RotateCw, TriangleAlert } from "lucide-react";
import { isRouteErrorResponse, useLocation, useNavigate, useRouteError } from "react-router-dom";
import { useAppStore } from "@renderer/store/app.store";
import "./RouteError.scss";

export const RouteError: FC = () => {
	const error = useRouteError();
	const navigate = useNavigate();
	const location = useLocation();
	const developer = useAppStore((state) => state.settings.developer.enabled);
	const detail = error instanceof Error ? error.stack ?? error.message
		: isRouteErrorResponse(error) ? `${error.status} ${error.statusText}`
			: String(error);

	return (
		<div className="route-error">
			<section className="route-error__panel glass">
				<div className="route-error__icon"><TriangleAlert size={25} /></div>
				<h1>Что-то пошло не так</h1>
				<p>Произошла ошибка. Вернитесь назад или перезапустите приложение.</p>
				<Space wrap>
					<Button icon={<ArrowLeft size={15} />} onClick={() => location.pathname === "/" ? navigate("/", { replace: true }) : navigate(-1)}>Назад</Button>
					<Button type="primary" icon={<RotateCw size={15} />} onClick={() => {
						if (window.api?.dev?.relaunch) void window.api.dev.relaunch().catch(() => window.location.reload());
						else window.location.reload();
					}}>Перезапустить приложение</Button>
				</Space>
				{developer && <details className="route-error__details"><summary>Информация для разработчика</summary><pre>{detail}</pre></details>}
			</section>
		</div>
	);
};
