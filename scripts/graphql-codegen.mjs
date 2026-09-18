import { generate } from '@graphql-codegen/cli';
import { readFile } from 'node:fs/promises';
import config from '../codegen.mts';
const check = process.argv.includes('--check');
const outputs = await generate(config, !check);
if (check) {
  const stale = [];
  for (const output of outputs) {
    const current = await readFile(output.filename, 'utf8').catch(() => null);
    if (current !== output.content) stale.push(output.filename);
  }
  if (stale.length) throw new Error(`Generated GraphQL files are stale. Run npm run graphql:generate:\n${stale.join('\n')}`);
  console.log('GraphQL artifacts match the checked-in schema and operations.');
}
