import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright generated files:
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    // New React Hooks rules introduced with eslint-config-next 16.2.x.
    // Temporarily disabled to unblock dependency bumps; address in a
    // dedicated refactor PR (e.g. extract data-loading into event handlers
    // or use derived state instead of syncing inside effects).
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
