
import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
    { 
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
        plugins: { js }, 
        extends: ["js/recommended"], 
        languageOptions: { globals: globals.browser } 
    },
    tseslint.configs.recommended,
    {
        plugins: {
            "unused-imports": unusedImports
        },
        rules: {
            eqeqeq: "off",
            semi: "error",
            "no-duplicate-imports": "error",
            "sort-imports": "error",
            "unused-imports/no-unused-imports": "error",
            "no-unused-vars": "error"
        },
    },
]);
