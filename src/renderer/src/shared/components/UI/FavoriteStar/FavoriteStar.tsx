import { FC, useState } from "react";
import { LazyTooltip } from "@renderer/shared/components/UI/LazyTooltip/LazyTooltip";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

import "./FavoriteStar.scss";

type FavoriteStarProps = {
	isFavorite: boolean;
	onFavorite: (id: string) => void;
	itemId: string;
	className?: string;
};

/** Звезда избранного: у избранных видна всегда, у остальных — при наведении на карточку */
export const FavoriteStar: FC<FavoriteStarProps> = ({ isFavorite, onFavorite, itemId, className = "" }) => {
	const [isAnimating, setIsAnimating] = useState(false);

	const handleClick = (e: React.MouseEvent): void => {
		e.stopPropagation();

		setIsAnimating(true);
		onFavorite(itemId);

		setTimeout(() => {
			setIsAnimating(false);
		}, 1000);
	};

	return (
		<LazyTooltip title={isFavorite ? "Убрать из избранного" : "В избранное"}>
			<motion.button
				type="button"
				aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
				aria-pressed={isFavorite}
				className={`favorite-star ${isFavorite ? "favorite-star--active" : ""} ${isAnimating ? "favorite-star--animating" : ""} ${className}`}
				onClick={handleClick}
				onDoubleClick={(e) => e.stopPropagation()}
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
				<Star size={15} strokeWidth={2} fill={isFavorite ? "currentColor" : "none"} />
			</motion.button>
		</LazyTooltip>
	);
};
