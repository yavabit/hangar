export const formatRelativeTime = (timestamp: string): string => {
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (diffSeconds < 1) {
		return "только что";
	}

	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30);

	if (months >= 1) {
		const remainingDays = days - months * 30;
		const remainingWeeks = Math.floor(remainingDays / 7);
		return `${months} мес${remainingWeeks > 0 ? ` ${remainingWeeks} нед` : ""} назад`;
	}

	if (weeks >= 1) {
		return `${weeks} нед ${days % 7} д назад`;
	}

	if (days >= 1) {
		return `${days} дн ${hours % 24} ч назад`;
	}

	if (hours >= 1) {
		return `${hours} ч ${minutes % 60} мин назад`;
	}

	if (minutes >= 1) {
		return `${minutes} мин ${diffSeconds % 60} сек назад`;
	}

	return `${diffSeconds} сек назад`;
};
