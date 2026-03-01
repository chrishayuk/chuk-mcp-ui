import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "**/dist/**",
      "**/dist-client/**",
      "**/storybook-static/**",
      "**/node_modules/**",
      "**/*.js",
      "**/*.mjs",
      "**/*.cjs",
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React hooks
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Project-specific overrides
  {
    rules: {
      // Match existing codebase conventions
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
