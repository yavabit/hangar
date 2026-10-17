import { useAppStore } from "@renderer/store/app.store";
import { useEffect, useState } from "react";
import { Button, Result } from "antd";
import { motion } from "framer-motion";
import { Router } from "./router";
import { getSplashRemainingTime, hideSplash } from "./splash";

function App(): React.JSX.Element | null {
	const load = useAppStore((s) => s.load);
	const hydrated = useAppStore((s) => s.hydrated);
	const loadError = useAppStore((s) => s.loadError);
	const setProjects = useAppStore((s) => s.setProjects);
	const setHealth = useAppStore((s) => s.setHealth);

	const [splashDone, setSplashDone] = useState(false);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		const unsubscribeProjects = window.api.projects.onChanged(setProjects);
		const unsubscribeHealth = window.api.projects.onHealth(setHealth);

		return () => {
			unsubscribeProjects();
			unsubscribeHealth();
		};
	}, [setProjects, setHealth]);

	useEffect(() => {
		if (!hydrated && !loadError) {
			return;
		}

		const timer = setTimeout(() => {
			hideSplash();
			setSplashDone(true);
		}, loadError ? 0 : getSplashRemainingTime());

		return () => clearTimeout(timer);
	}, [hydrated, loadError]);

	if (loadError && !hydrated) {
		return (
			<Result
				status="error"
				title="Не удалось загрузить данные"
				subTitle={loadError}
				extra={
					<Button type="primary" onClick={() => void load()}>
						Повторить
					</Button>
				}
			/>
		);
	}

	if (!hydrated) {
		return null;
	}

	return (
		<motion.div
			className="app"
			initial={{ opacity: 0, y: 12 }}
			animate={splashDone ? { opacity: 1, y: 0 } : undefined}
			transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
		>
			<Router />
		</motion.div>
	);
}

export default App;
