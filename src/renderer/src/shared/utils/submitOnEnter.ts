/**
 * Enter в поле формы отправляет её, как кнопка OK в модальном окне. Не срабатывает в выпадающих
 * списках (там Enter выбирает вариант) и при наборе через IME. В многострочном поле — Ctrl+Enter.
 */
export const submitOnEnter =
	(submit: () => void) =>
	(event: React.KeyboardEvent): void => {
		if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
			return;
		}

		const target = event.target as HTMLElement;
		const isTextInput = target instanceof HTMLInputElement && target.getAttribute("role") !== "combobox";
		const isTextArea = target instanceof HTMLTextAreaElement && (event.ctrlKey || event.metaKey);

		if (isTextInput || isTextArea) {
			event.preventDefault();
			submit();
		}
	};
