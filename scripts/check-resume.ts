/**
 * Проверка файла резюме без браузера: `pnpm check-resume [путь]`, по умолчанию `resume.json`.
 * Файл проходит те же распаковку, миграции и схему, что и импорт в редакторе. Модули
 * приложения грузятся через Vite, чтобы работали его плагины (например, иконки брендов).
 */
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { createServer } from 'vite';
import type { ConfigIssue } from '../src/config';

const file = process.argv[2] ?? 'resume.json';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false }
});

try {
  const { unpackText } = await server.ssrLoadModule('/src/state/envelope.ts');
  const { validateConfig } = await server.ssrLoadModule('/src/config/validate.ts');
  const unpacked = unpackText(await readFile(file, 'utf8'));
  if (!unpacked.ok) {
    console.error(`${file}: ${unpacked.message}`);
    process.exitCode = 1;
  } else {
    const result = validateConfig(unpacked.cv);
    if (result.ok) {
      console.log(`${file}: ошибок нет, можно импортировать в редактор`);
    } else {
      console.error(`${file}: ошибок ${result.issues.length}`);
      for (const { path, message } of result.issues as ConfigIssue[]) {
        console.error(`  ${path === '' ? '(всё резюме)' : path}: ${message}`);
      }
      process.exitCode = 1;
    }
  }
} catch (error) {
  console.error(`${file}: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await server.close();
}
