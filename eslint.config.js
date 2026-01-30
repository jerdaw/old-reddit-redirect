import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "off",
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line"],
      "no-var": "error",
      "prefer-const": "error",
      "no-implicit-globals": "error",
      strict: ["error", "global"],
    },
  },
  {
    ignores: ["node_modules/**", "*.zip", "_metadata/**", "eslint.config.js"],
  },
  eslintConfigPrettier,
];
