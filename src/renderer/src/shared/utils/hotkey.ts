/** Человекочитаемый вид: CommandOrControl → Ctrl (⌘ на macOS) */
export const formatHotkey = (accelerator: string): string =>
	accelerator
		.replace("CommandOrControl", window.electron.process.platform === "darwin" ? "⌘" : "Ctrl")
		.replace("Control", "Ctrl")
		.split("+")
		.join(" + ");
