import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

type PackageJson = { version: string; dependencies?: Record<string, string>; devDependencies?: Record<string, string> }

const readPackage = (path: string): PackageJson => JSON.parse(readFileSync(path, 'utf8'))

/** Установленные версии пакетов на момент сборки — для карточки «Информация» в режиме разработчика */
const collectPackages = (): Record<string, string> => {
  const pkg = readPackage(resolve('package.json'))
  // Пакеты со scope (@types/…, @electron-toolkit/…) — служебные, без них список короче
  const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]
    .filter((name) => !name.startsWith('@'))
    .sort()

  return Object.fromEntries(
    names.map((name) => {
      try {
        return [name, readPackage(resolve('node_modules', name, 'package.json')).version]
      } catch {
        return [name, '?']
      }
    }),
  )
}

export default defineConfig({
  main: {
    define: {
      __APP_PACKAGES__: JSON.stringify(collectPackages()),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@schemas': resolve('src/shared/schemas'),
        '@common': resolve('src/shared'),
        '@shared': resolve('src/renderer/src/shared'),
      }
    },
    plugins: [react()]
  }
})
