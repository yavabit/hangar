import type { PathAliasSchemaType } from "@schemas/store.schema";

/** Проверка списка алиасов для Form.Item */
export const validatePathAliases = async (_: unknown, aliases?: PathAliasSchemaType[]): Promise<void> => {
	const names = new Set<string>();

	for (const item of aliases ?? []) {
		if (item.alias.length < 2) {
			throw new Error("У каждого алиаса должно быть имя, например @work");
		}
		if (!item.path.trim()) {
			throw new Error(`Выберите папку для ${item.alias}`);
		}
		if (names.has(item.alias)) {
			throw new Error(`Алиас ${item.alias} указан дважды`);
		}
		names.add(item.alias);
	}
};
