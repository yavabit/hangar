import { useCallback } from "react";
import { useAppStore } from "@renderer/store/app.store";
import type { PathAliasSchemaType } from "@schemas/store.schema";
import { resolveAliasPath } from "@common/utils/pathAliases";

const NO_ALIASES: PathAliasSchemaType[] = [];

type UsePathAliases = {
	aliases: PathAliasSchemaType[];
	/** Полный путь с учётом алиасов из сохранённых настроек */
	resolvePath: (path: string) => string;
};

export const usePathAliases = (): UsePathAliases => {
	const aliases = useAppStore((s) => s.settings.common.pathAliases ?? NO_ALIASES);

	const resolvePath = useCallback((path: string) => resolveAliasPath(path, aliases), [aliases]);

	return { aliases, resolvePath };
};
