/**
 * Ошибки из ipcMain.handle приходят как «Error invoking remote method 'x': Error: текст».
 * Для уведомлений оставляем только сам текст.
 */
export const getIpcErrorMessage = (error: unknown): string => {
	const message = error instanceof Error ? error.message : String(error);
	return message.replace(/^Error invoking remote method '[^']+':\s*(Error:\s*)?/, "");
};
