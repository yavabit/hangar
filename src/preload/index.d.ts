import { ElectronAPI } from "@electron-toolkit/preload";
import type { ElectronApi as apiType } from "../shared/api/api.types";

declare global {
	interface Window {
		electron: ElectronAPI;
		api: apiType;
	}
}
