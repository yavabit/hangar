import type { PathAliasSchemaType } from "../schemas/store.schema";

/**
 * Пути проектов могут храниться через алиас: "@work/shop-frontend".
 * Полный путь вычисляется при использовании, поэтому смена пути алиаса
 * в настройках «переносит» все его проекты.
 */

type Alias = Pick<PathAliasSchemaType, "alias" | "path">;

export type ParsedAliasPath = {
	alias: string;
	/** Часть пути после алиаса, через "/" */
	rest: string;
};

const ALIAS_PATH_RE = /^(@[A-Za-z0-9_-]+)(?:[\\/]+(.*))?$/;

const trimTrailingSeparators = (path: string): string => path.replace(/[\\/]+$/, "");

const normalizeForCompare = (path: string): string =>
	trimTrailingSeparators(path.trim()).replace(/\\/g, "/").toLowerCase();

export const parseAliasPath = (path: string): ParsedAliasPath | null => {
	const match = ALIAS_PATH_RE.exec(path.trim());
	if (!match) {
		return null;
	}

	return { alias: match[1], rest: (match[2] ?? "").replace(/\\/g, "/").replace(/\/+$/, "") };
};

export const buildAliasPath = (alias: string, rest: string): string => {
	const cleanRest = rest.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
	return cleanRest ? `${alias}/${cleanRest}` : alias;
};

/** Алиас, который можно использовать: с именем и путём */
export const findAlias = <T extends Alias>(aliases: T[] | undefined, name: string): T | undefined =>
	aliases?.find((a) => a.alias === name && a.path.trim());

/** Присоединяет относительную часть к папке алиаса, сохраняя её разделитель */
export const joinAliasPath = (base: string, rest: string): string => {
	const cleanRest = rest.replace(/^[\\/]+/, "");
	const root = trimTrailingSeparators(base) || base;
	if (!cleanRest) {
		return root;
	}

	const separator = base.includes("\\") ? "\\" : "/";
	return `${root}${separator}${cleanRest.replace(/[\\/]+/g, separator)}`;
};

/** Полный путь проекта. Путь с неизвестным алиасом возвращается как есть */
export const resolveAliasPath = (path: string, aliases: Alias[] | undefined): string => {
	const parsed = parseAliasPath(path);
	if (!parsed) {
		return path;
	}

	const alias = findAlias(aliases, parsed.alias);
	return alias ? joinAliasPath(alias.path, parsed.rest) : path;
};

/** Путь ссылается на алиас, которого нет в настройках */
export const hasUnknownAlias = (path: string, aliases: Alias[] | undefined): boolean => {
	const parsed = parseAliasPath(path);
	return !!parsed && !findAlias(aliases, parsed.alias);
};

/**
 * Переводит полный путь в форму с алиасом, если он лежит внутри папки алиаса.
 * Из нескольких подходящих выбирается самый «глубокий».
 */
export const toAliasPath = (absolutePath: string, aliases: Alias[] | undefined): string | null => {
	if (parseAliasPath(absolutePath)) {
		return null;
	}

	const target = normalizeForCompare(absolutePath);
	let best: { alias: string; base: string } | null = null;

	for (const alias of aliases ?? []) {
		if (!alias.path.trim() || alias.alias.length < 2) {
			continue;
		}

		const base = normalizeForCompare(alias.path);
		const isInside = target === base || target.startsWith(`${base}/`);
		if (isInside && (!best || base.length > best.base.length)) {
			best = { alias: alias.alias, base };
		}
	}

	if (!best) {
		return null;
	}

	const rest = trimTrailingSeparators(absolutePath.trim()).replace(/\\/g, "/").slice(best.base.length);
	return buildAliasPath(best.alias, rest);
};

/** Заменяет алиас в пути: используется при переименовании алиаса */
export const renameAliasInPath = (path: string, from: string, to: string): string => {
	const parsed = parseAliasPath(path);
	return parsed && parsed.alias === from ? buildAliasPath(to, parsed.rest) : path;
};
