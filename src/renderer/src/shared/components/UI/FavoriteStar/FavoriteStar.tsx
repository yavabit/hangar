import { useState } from "react";
import { Tooltip } from "antd";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FavoriteStar.module.scss";

export const FavoriteStar: FC<{
	isFavorite: boolean;
	onFavorite: (id: string) => void;
	itemId: string;
	className?: string;
}> = ({ isFavorite, onFavorite, itemId, className = "" }) => {
	const [isAnimating, setIsAnimating] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();

		setIsAnimating(true);

		onFavorite(itemId);

		setTimeout(() => {
			setIsAnimating(false);
		}, 1000);
	};

	return (
		<div className={`${styles["favorite-star-wrapper"]} ${className} ${isAnimating ? "animated" : ""}`}>
			<Tooltip
				title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
			>
				<motion.div
					className={styles["fav-ico-lnk"]}
					onClick={handleClick}
					whileHover={{ scale: 1.2 }}
					whileTap={{ scale: 0.8 }}
					animate={isAnimating ? "pop" : "idle"}
					variants={{
						idle: { scale: 1, rotate: 0 },
						pop: {
							scale: [1, 1.4, 1],
							rotate: [0, 180, 360],
							transition: { duration: 0.6, ease: "easeInOut" },
						},
					}}
				>
					{isFavorite ? (
						<StarFilled
							className={styles["star-icon"]}
							style={{ color: "#faad14", fontSize: "20px" }}
						/>
					) : (
						<StarOutlined
							className={styles["star-icon"]}
							style={{ fontSize: "20px" }}
						/>
					)}
				</motion.div>
			</Tooltip>
		</div>
	);
};
