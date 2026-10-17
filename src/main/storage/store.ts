import Store from "electron-store";
import { copyFileSync, existsSync } from "fs";

import {
	DEFAULT_SETTINGS,
	STORE_VERSION,
	StoreSchema,
	withDefaultSettings,
	type StoreType,
} from "../../shared/schemas/store.schema";

//@ts-ignore def export
const StoreClass = (Store.default ?? Store) as typeof Store;

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
