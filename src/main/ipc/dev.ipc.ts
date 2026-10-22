import { app, BrowserWindow, clipboard, dialog, ipcMain, shell } from "electron";
import { readFile, stat, writeFile } from "fs/promises";
import { arch, cpus, release, totalmem, version } from "os";
import { basename, join } from "path";
import { backupStoreFile, store } from "../storage/store";
import { resetTrayState } from "../tray";
import { StatusService } from "../services/status.service";
import { STORE_VERSION, StoreSchema, withDefaultSettings, type StoreType } from "../../shared/schemas/store.schema";
import type { DataImportPreview, DevInfo } from "../../shared/api/api.types";

const ENGINE_KEYS = ["electron", "chrome", "node", "v8", "uv", "zlib", "icu", "unicode"];

type ExportFile = {
	app: "Hangar";
	appVersion: string;
	exportedAt: string;
	data: StoreType;
};

/** Проверенные данные из выбранного файла ждут подтверждения в интерфейсе */
let pendingImport: StoreType | null = null;

/**
 * При npm run dev electron-vite завершается вместе с Electron: новый процесс остался бы без dev-сервера
 * и держал бы блокировку одного экземпляра, из-за которой следующий npm run dev сразу закрывается.
 * Поэтому в разработке окна только перезагружаются
 */
const relaunch = (): void => {
	if (!app.isPackaged) {
		BrowserWindow.getAllWindows().forEach((window) => window.reload());
		void StatusService.refresh("force");
		return;
	}

	app.relaunch();
	app.exit(0);
};

const getInfo = async (): Promise<DevInfo> => {
	const data = store.store;
	const dataSize = await stat(store.path).then((s) => s.size).catch(() => 0);

	return {
		app: {
			version: app.getVersion(),
			packaged: app.isPackaged,
			executable: process.execPath,
			uptime: Math.round(process.uptime()),
		},
		system: {
			name: `${version()} ${release()}`,
			platform: process.platform,
			arch: arch(),
			cpu: cpus()[0]?.model.trim() ?? "-",
			cores: cpus().length,
			memory: totalmem(),
			locale: app.getLocale(),
		},
		engine: Object.fromEntries(
			ENGINE_KEYS.filter((key) => process.versions[key]).map((key) => [key, String(process.versions[key])]),
		),
		data: {
			userData: app.getPath("userData"),
			dataFile: store.path,
			dataSize,
			projects: data.projects.length,
			folders: data.folders.length,
			aliases: data.settings.common.pathAliases?.length ?? 0,
		},
		packages: __APP_PACKAGES__,
	};
};

/** Принимает и выгрузку Hangar, и сам файл launcher-data.json */
const parseImport = (raw: string): { data: StoreType; meta: Partial<ExportFile> } => {
	let json: unknown;
	try {
		json = JSON.parse(raw);
	} catch {
		throw new Error("Файл не похож на JSON");
	}

	const meta = (json && typeof json === "object" && "data" in json ? json : {}) as Partial<ExportFile>;
	const source = (meta.data ?? json) as Partial<StoreType>;
	const parsed = StoreSchema.safeParse({
		version: STORE_VERSION,
		projects: [],
		folders: [],
		...source,
		settings: withDefaultSettings(source?.settings),
	});

	if (!parsed.success) {
		const issues = parsed.error.issues
			.slice(0, 3)
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; ");
		throw new Error(`В файле нет данных Hangar или они повреждены (${issues})`);
	}

	return { data: { ...parsed.data, version: STORE_VERSION }, meta };
};

export function registerDevIpc(): void {
	ipcMain.handle("dev:getInfo", getInfo);

	ipcMain.handle("dev:openDataFolder", async () => {
		await shell.openPath(app.getPath("userData"));
	});

	ipcMain.handle("dev:openDevTools", (event) => {
		event.sender.openDevTools({ mode: "detach" });
	});

	ipcMain.handle("dev:relaunch", relaunch);

	ipcMain.handle("dev:copyText", (_, text: unknown) => {
		if (typeof text === "string") {
			clipboard.writeText(text.slice(0, 100_000));
		}
	});

	ipcMain.handle("dev:resetData", () => {
		store.clear();
		resetTrayState();
		relaunch();
	});

	ipcMain.handle("dev:exportData", async (): Promise<string | null> => {
		const date = new Date().toISOString().slice(0, 10);
		const result = await dialog.showSaveDialog({
			title: "Сохранить данные Hangar",
			defaultPath: join(app.getPath("documents"), `hangar-data-${date}.json`),
			filters: [{ name: "JSON", extensions: ["json"] }],
		});
		if (result.canceled || !result.filePath) {
			return null;
		}

		const file: ExportFile = {
			app: "Hangar",
			appVersion: app.getVersion(),
			exportedAt: new Date().toISOString(),
			data: store.store,
		};
		await writeFile(result.filePath, JSON.stringify(file, null, "\t"), "utf8");
		return result.filePath;
	});

	ipcMain.handle("dev:pickImport", async (): Promise<DataImportPreview | null> => {
		pendingImport = null;
		const result = await dialog.showOpenDialog({
			title: "Загрузить данные Hangar",
			defaultPath: app.getPath("documents"),
			filters: [{ name: "JSON", extensions: ["json"] }],
			properties: ["openFile"],
		});
		if (result.canceled || !result.filePaths[0]) {
			return null;
		}

		const path = result.filePaths[0];
		const { data, meta } = parseImport(await readFile(path, "utf8"));
		pendingImport = data;

		return {
			file: basename(path),
			appVersion: meta.appVersion ?? null,
			exportedAt: meta.exportedAt ?? null,
			projects: data.projects.length,
			folders: data.folders.length,
			aliases: data.settings.common.pathAliases?.length ?? 0,
		};
	});

	ipcMain.handle("dev:applyImport", () => {
		if (!pendingImport) {
			throw new Error("Сначала выберите файл");
		}

		backupStoreFile("before-import");
		store.store = pendingImport;
		pendingImport = null;
		relaunch();
	});
}
