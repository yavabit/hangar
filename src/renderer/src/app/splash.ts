/** Минимальное время показа сплэша с момента запуска окна, чтобы он не «мигал» */
export const SPLASH_MIN_DURATION_MS = 2100;

const FADE_DURATION_MS = 450;

const getSplash = (): HTMLElement | null => document.getElementById("splash");

export const getSplashRemainingTime = (): number => {
	return Math.max(0, SPLASH_MIN_DURATION_MS - performance.now());
};

export const hideSplash = (): void => {
	const splash = getSplash();
	if (!splash || splash.classList.contains("splash--hidden")) {
		return;
	}

	splash.classList.add("splash--hidden");
	setTimeout(() => splash.remove(), FADE_DURATION_MS);
};

/** Убирает сплэш сразу, без анимации: окну быстрого поиска он не нужен */
export const removeSplash = (): void => {
	getSplash()?.remove();
};
