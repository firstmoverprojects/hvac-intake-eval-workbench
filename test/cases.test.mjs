import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import cases from '../lib/cases.js';

const demoJson = JSON.parse(await readFile(new URL('../data/demo-12.json', import.meta.url), 'utf8'));
const demoJsonl = await readFile(new URL('../data/demo-3.jsonl', import.meta.url), 'utf8');

test('bundled demo datasets satisfy the case contract', () => {
  assert.equal(cases.validateCases(demoJson).ok, true);
  const shortDemo = cases.parseJsonLines(demoJsonl);
  assert.equal(shortDemo.ok, true);
  assert.equal(shortDemo.value.length, 3);
});

test('short demo uses visibly synthetic contact data', () => {
  const parsed = cases.parseJsonLines(demoJsonl);
  for (const item of parsed.value) {
    assert.match(item.shop_name, /^Example /);
    assert.match(item.form_fields.name, /^Demo Person /);
    assert.match(item.form_fields.phone, /^555-01\d{2}$/);
    if (item.form_fields.email) assert.match(item.form_fields.email, /@example\.test$/);
  }
});

test('JSONL parsing reports the source line', () => {
  const result = cases.parseJsonLines('{"case_id":"first"}\nnot-json');
  assert.equal(result.ok, false);
  assert.match(result.error, /line 2/);
});

test('case validation rejects duplicate IDs and inconsistent gold', () => {
  const duplicate = [demoJson[0], structuredClone(demoJson[0])];
  assert.match(cases.validateCases(duplicate).error, /Duplicate case_id/);

  const mismatch = structuredClone(demoJson[0]);
  mismatch.expected.trade = 'plumbing';
  assert.match(cases.validateCase(mismatch).error, /expected\.trade/);
});

test('webhook readiness must match required field presence', () => {
  const invalid = structuredClone(demoJson[0]);
  invalid.expected.required_fields_present = ['name', 'phone'];
  assert.match(cases.validateCase(invalid).error, /webhook_ready/);
});

test('case validation supports the scorer unknown-trade label', () => {
  const unknown = structuredClone(demoJson[0]);
  unknown.trade = 'unknown';
  unknown.expected.trade = 'unknown';
  assert.equal(cases.validateCase(unknown).ok, true);
});
