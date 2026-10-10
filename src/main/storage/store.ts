import Store from "electron-store";

import { StoreSchema, type StoreType } from "../../shared/schemas/store.schema";

//@ts-ignore def export
const StoreClass = (Store.default ?? Store) as typeof Store;

export const store = new StoreClass<StoreType>({
	name: "launcher-data",

	defaults: {
		version: 1,
		settings: {
			common: {
				pathAliases: [],
				defaultIDE: "vscode",
				defaultConsole: "powershell",
				taskTrackerUrl: "",
			},

			git: {
				gitSynch: false,
				gitProvider: "gitlab",
				url: "",
			},
		},

		projects: [],
		folders: [],
	},
});

const parsed = StoreSchema.safeParse(store.store);

if (!parsed.success) {
	console.error("Store validation failed", parsed.error);
	//store.clear();
}
