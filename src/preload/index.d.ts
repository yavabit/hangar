import type { ElectronApi as apiType, RuntimeInfo } from "../shared/api/api.types";

declare global {
	interface Window {
		electron: RuntimeInfo;
		api: apiType;
	}
}
