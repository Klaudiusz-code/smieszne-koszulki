import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,export {};', shortCircuit: true };
    let url;
    if (specifier.startsWith('@/')) url = pathToFileURL(resolve(specifier.slice(2))).href;
    else if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) url = new URL(specifier, context.parentURL).href;
    if (url) {
      for (const extension of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        if (existsSync(fileURLToPath(url + extension)) && /\.tsx?$/.test(url + extension)) return { url: url + extension, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && /\.tsx?$/.test(url)) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        fileName: fileURLToPath(url),
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText;
      return { format: 'module', source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
