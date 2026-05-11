// ESLint 9 flat config + Next.js 16
// Doc oficial: https://nextjs.org/docs/app/api-reference/config/eslint
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
    "tsconfig.tsbuildinfo",
  ]),
  {
    rules: {
      // Padrão de hidratação de localStorage gera setState dentro de useEffect
      // de propósito. A regra é warning conceitual, não erro de produto.
      "react-hooks/set-state-in-effect": "warn",
      // Regras opinionadas do React Compiler — warning é suficiente
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
    },
  },
])

export default eslintConfig
