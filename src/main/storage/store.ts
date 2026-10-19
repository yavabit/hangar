import Store from "electron-store";
import { app } from "electron";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

import {
	DEFAULT_SETTINGS,
	STORE_VERSION,
	StoreSchema,
	withDefaultSettings,
	type StoreType,
} from "../../shared/schemas/store.schema";

//@ts-ignore def export
const StoreClass = (Store.default ?? Store) as typeof Store;

const STORE_FILE = "launcher-data.json";

/**
 * До переименования приложение называлось project-launcher и хранило данные в одноимённой папке.
 * Если в новой папке данных ещё нет, переносим их оттуда, чтобы ничего не потерялось.
 */
const importLegacyData = (): void => {
	const target = join(app.getPath("userData"), STORE_FILE);
	const legacy = join(app.getPath("appData"), "project-launcher", STORE_FILE);

	if (existsSync(target) || !existsSync(legacy)) {
		return;
	}

	mkdirSync(dirname(target), { recursive: true });
	copyFileSync(legacy, target);
};

importLegacyData();

export const store = new StoreClass<StoreType>({
	name: "launcher-data",

	defaults: {
		version: STORE_VERSION,
		settings: DEFAULT_SETTINGS,
		projects: [],
		folders: [],
	},
});

const backupStoreFile = (reason: string): string | null => {
	if (!existsSync(store.path)) {
		return null;
	}

	const stamp = new Date().toISOString().replace(/[:.]/g, "-");
	const backupPath = store.path.replace(/\.json$/, `.${reason}-${stamp}.json`);
	copyFileSync(store.path, backupPath);
	return backupPath;
};

export type StoreValidationResult = { ok: true } | { ok: false; message: string; backupPath: string | null };

/** Проверяет данные по схеме. При ошибке сохраняет копию файла, чтобы данные можно было восстановить */
export function validateStore(): StoreValidationResult {
	const parsed = StoreSchema.safeParse({ ...store.store, settings: withDefaultSettings(store.store.settings) });
	if (parsed.success) {
		if (store.get("version") !== STORE_VERSION) {
			store.set("version", STORE_VERSION);
		}
		return { ok: true };
	}

	console.error("Store validation failed", parsed.error);

	return {
		ok: false,
		message: parsed.error.issues
			.slice(0, 5)
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("\n"),
		backupPath: backupStoreFile("invalid"),
	};
}
