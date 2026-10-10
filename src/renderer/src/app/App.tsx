import { useAppStore } from "@renderer/store/app.store";
import { useEffect } from "react";
import { Loading } from "@renderer/shared/components/UI/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Router } from "./router";

function App(): React.JSX.Element {
	const load = useAppStore((s) => s.load);
	const hydrated = useAppStore((s) => s.hydrated);
	const setProjects = useAppStore((s) => s.setProjects);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		const unsubscribe = window.api.app.onLastOpenedUpdated((projects) => {
			setProjects(projects);
		});

		return unsubscribe;
	}, [setProjects]);

	return (
		<AnimatePresence mode="wait">
			{!hydrated && (
				<motion.div
					key="loader"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{
						opacity: 0,
						transition: { duration: 0.35, ease: "easeOut" },
					}}
				>
					<Loading />
				</motion.div>
			)}

			{hydrated && (
				<motion.div
					className="app"
					initial={{ opacity: 0, y: 24, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{
						duration: 1.25,
						ease: [0.25, 0.1, 0.25, 1],
					}}
					style={{
						willChange: "transform, opacity",
					}}
				>
					<Router />
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default App;
