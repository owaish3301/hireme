import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import onlyWarn from "eslint-plugin-only-warn";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  {
    // lint TypeScript too: ESLint only picks up .js/.mjs/.cjs on its own
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { fixStyle: "separate-type-imports" },
      ],
      // `import { type A }` → `import type { A }`
      "@typescript-eslint/no-import-type-side-effects": "warn",
      // prefix with _ to mark an unused param as intentional,
      // e.g. express error handlers must declare `next` to be recognised
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // keep last: turns off rules that would fight Prettier's formatting
  eslintConfigPrettier,
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", "**/*.d.ts"],
  },
];
