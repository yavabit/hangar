/** Установленные версии пакетов из package.json, подставляются при сборке (electron.vite.config.ts) */
declare const __APP_PACKAGES__: Record<string, string>;

/** Время сборки main-процесса, ISO */
declare const __BUILD_DATE__: string;
