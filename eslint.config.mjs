import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintReact from '@eslint-react/eslint-plugin'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslintReact.configs['recommended-typescript'],
      // Правила хуков проверяет eslint-plugin-react-hooks
      eslintReact.configs['disable-conflict-eslint-plugin-react-hooks'],
    ],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules
    }
  }
)
