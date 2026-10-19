/** Один форматтер на всё приложение: создавать его на каждый вызов дорого, а дат на экране сотни */
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" });

/** Короткое относительное время одной единицей: «5 мин назад», «3 дн назад» */
export const formatRelativeTime = (timestamp?: string): string => {
	if (!timestamp) {
		return "-";
	}

	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (diffSeconds < 60) {
		return "только что";
	}

	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (years >= 1) {
		return `${years} г назад`;
	}

	if (months >= 1) {
		return `${months} мес назад`;
	}

	if (weeks >= 1) {
		return `${weeks} нед назад`;
	}

	if (days >= 1) {
		return `${days} дн назад`;
	}

	if (hours >= 1) {
		return `${hours} ч назад`;
	}

	return `${minutes} мин назад`;
};

export const formatDateTime = (timestamp?: string): string => {
	if (!timestamp) {
		return "";
	}

	const date = new Date(timestamp);
	return Number.isNaN(date.getTime()) ? "" : DATE_TIME_FORMAT.format(date);
};
