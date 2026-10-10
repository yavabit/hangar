import { store } from "./store";

import type { AppSettings } from "../../shared/schemas/store.schema";

export class SettingsStorage {
	static get(): AppSettings {
		return store.get("settings");
	}

	static set(settings: AppSettings): {success: boolean} | void {
		store.set("settings", settings);
	}
}
