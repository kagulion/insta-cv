import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', '.astro', 'node_modules']),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended
]);
