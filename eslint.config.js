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
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
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
    files: ["tests/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      strict: "off",
      "no-implicit-globals": "off",
    },
  },
  {
    files: [
      "scripts/**/*.js",
      "vitest.config.js",
      "src/content/keyboard-utils.js",
    ],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      strict: "off",
      "no-implicit-globals": "off",
    },
  },
  {
    files: ["modules/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
    rules: {
      strict: "off",
      "no-implicit-globals": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "*.zip",
      "_metadata/**",
      "eslint.config.js",
      "store/**",
    ],
  },
  eslintConfigPrettier,
];
