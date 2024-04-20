import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooksPlugin from "eslint-plugin-react-hooks";

// https://typescript-eslint.io/getting-started/
// https://www.raulmelo.me/en/blog/migration-eslint-to-flat-config
/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        ignores: [".idea/**", "dist/**", "eslint.config.js"],
    },
    eslint.configs.recommended,
    // TODO: https://github.com/typescript-eslint/typescript-eslint/issues/8891
    //       Meanwhile there would be some "errors" in tsx
    // tseslint.configs.recommended,
    {
        files: ["**/*.js", "**/*.ts", "**/*.tsx"],
        plugins: {
            // https://github.com/facebook/react/issues/28313
            "react-hooks": hooksPlugin,
        },
        rules: hooksPlugin.configs.recommended.rules,
    },
];
