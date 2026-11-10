import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('every local HTML asset reference resolves', async () => {
  const htmlFiles = (await readdir(root)).filter((name) => name.endsWith('.html'));
  for (const name of htmlFiles) {
    const source = await readFile(resolve(root, name), 'utf8');
    const references = [...source.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
      const path = reference.split(/[?#]/, 1)[0];
      const target = path === './' || path === '' ? resolve(root, 'index.html') : resolve(root, path);
      await assert.doesNotReject(access(target), name + ' references missing asset ' + reference);
    }
  }
});

test('workbench loads validation before application code', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  assert.match(html, /lib\/scorer\.js.*lib\/cases\.js.*app\.js/s);
});

test('gold cannot be requested through get_case', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  assert.doesNotMatch(app, /include_gold/);
  assert.match(app, /Gold is locked until this case has a score/);
  assert.doesNotMatch(app, /doScore\(input,false\)/);
  assert.match(app, /score_labels'.*readOnlyHint:false.*doScore\(input,true\)/s);
});

test('score state consistently uses Map accessors', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  assert.doesNotMatch(app, /state\.scores\[/);
  assert.match(app, /state\.scores\.has\(id\)/);
});
