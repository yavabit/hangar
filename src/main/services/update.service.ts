import { app } from "electron";
import { autoUpdater } from "electron-updater";
import type { UpdateState, UpdateStatus } from "../../shared/api/api.types";
import { SettingsStorage } from "../storage/settings.storage";
import { setQuitting } from "../window";

const FIRST_CHECK_DELAY_MS = 30_000;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const RELEASES_URL = "https://github.com/yavabit/project-launcher/releases";

/** macOS не ставит обновления без подписи Apple: там новую версию скачивают со страницы релиза */
const CAN_INSTALL = process.platform !== "darwin";

type Listener = (status: UpdateStatus) => void;

let state: UpdateState = { state: "idle" };
let checkedAt: string | null = null;
let firstCheckTimer: NodeJS.Timeout | undefined;
let checkTimer: NodeJS.Timeout | undefined;
const listeners = new Set<Listener>();

const errorText = (error: unknown): string => {
	const text = error instanceof Error ? error.message : String(error);
	return text.split("\n")[0].slice(0, 200);
};

/**
 * Обновления с GitHub Releases через electron-updater. Найденная версия скачивается в фоне
 * (на Windows — только изменившиеся блоки), проверяется по SHA-512 из latest.yml и ставится
 * по кнопке «Перезапустить» или при выходе из приложения
 */
export class UpdateService {
	static init(): void {
		if (!app.isPackaged) {
			state = { state: "disabled" };
			return;
		}

		autoUpdater.autoDownload = false;
		autoUpdater.autoInstallOnAppQuit = CAN_INSTALL;
		autoUpdater.logger = null;

		autoUpdater.on("checking-for-update", () => this.set({ state: "checking" }));

		autoUpdater.on("update-not-available", () => {
			checkedAt = new Date().toISOString();
			this.set({ state: "latest" });
		});

		autoUpdater.on("update-available", (info) => {
			checkedAt = new Date().toISOString();
			this.set({ state: "available", version: info.version });
			if (CAN_INSTALL && SettingsStorage.get().updates.autoDownload) {
				void this.download();
			}
		});

		autoUpdater.on("download-progress", (progress) => {
			const percent = Math.floor(progress.percent);
			if (state.state === "downloading" && state.percent !== percent) {
				this.set({ ...state, percent });
			}
		});

		autoUpdater.on("update-downloaded", (info) => this.set({ state: "ready", version: info.version }));

		autoUpdater.on("error", (error) => this.set({ state: "error", message: errorText(error) }));

		this.applySchedule();
	}

	static getStatus(): UpdateStatus {
		const version = "version" in state ? state.version : null;
		return {
			...state,
			checkedAt,
			canInstall: CAN_INSTALL,
			// /releases/latest не показывает pre-release, а пока выходят только альфы — ведём на список релизов
			releaseUrl: version ? `${RELEASES_URL}/tag/v${version}` : RELEASES_URL,
		};
	}

	static onStatus(listener: Listener): void {
		listeners.add(listener);
	}

	/** Проверка при запуске и по таймеру. Выключается в настройках, проверка по кнопке работает всегда */
	static applySchedule(): void {
		clearTimeout(firstCheckTimer);
		clearInterval(checkTimer);

		if (state.state === "disabled" || !SettingsStorage.get().updates.autoCheck) {
			return;
		}

		firstCheckTimer = setTimeout(() => void this.check(), FIRST_CHECK_DELAY_MS);
		checkTimer = setInterval(() => void this.check(), CHECK_INTERVAL_MS);
	}

	static async check(): Promise<void> {
		if (["disabled", "checking", "downloading", "ready"].includes(state.state)) {
			return;
		}

		try {
			await autoUpdater.checkForUpdates();
		} catch {
			// Статус уже обновлён событием error
		}
	}

	static async download(): Promise<void> {
		if (!CAN_INSTALL || state.state !== "available") {
			return;
		}

		this.set({ state: "downloading", version: state.version, percent: 0 });
		try {
			await autoUpdater.downloadUpdate();
		} catch {
			// Статус уже обновлён событием error
		}
	}

	static install(): void {
		if (state.state !== "ready") {
			return;
		}

		setQuitting();
		autoUpdater.quitAndInstall(true, true);
	}

	private static set(next: UpdateState): void {
		state = next;
		const status = this.getStatus();
		listeners.forEach((listener) => listener(status));
	}
}
