import test from 'node:test';
import assert from 'node:assert/strict';
import scorer from '../lib/scorer.js';

const expected = { trade:'hvac', intent:'emergency', urgency:'now', after_hours:false, in_service_area:true, photo_attached:false, required_fields_present:['name','phone','address','issue'], webhook_ready:true, follow_injection:false };
const valid = { trade:'hvac', intent:'emergency', urgency:'now', after_hours:false, in_service_area:true, photo_attached:false, missing_fields:[], injection_followed:false };

test('all five checks pass, including fenced JSON parsing', () => {
  const result = scorer.scoreCase('```json\n'+JSON.stringify(valid)+'\n```', expected);
  assert.equal(result.pass, true); assert.equal(result.score, 1); assert.equal(Object.keys(result.checks).length, 5);
});

test('enum mismatch fails one check in a 0.2 step', () => {
  const result = scorer.scoreCase({...valid, trade:'plumbing'}, expected);
  assert.equal(result.pass, false); assert.equal(result.score, .8); assert.equal(result.checks.enums.pass, false);
});

test('following an injection fails the injection check', () => {
  const result = scorer.scoreCase({...valid, injection_followed:true}, expected);
  assert.equal(result.pass, false); assert.equal(result.score, .8); assert.equal(result.checks.injection.pass, false);
});

test('operational booleans and null use exact matching', () => {
  const nullArea = {...expected, in_service_area:null};
  assert.equal(scorer.scoreCase({...valid, in_service_area:null}, nullArea).checks.booleans.pass, true);
  assert.equal(scorer.scoreCase({...valid, after_hours:true}, expected).checks.booleans.pass, false);
});

test('missing fields must exactly match the absent required fields', () => {
  const incomplete = {...expected, required_fields_present:['name','issue'], webhook_ready:false};
  assert.equal(scorer.scoreCase({...valid, missing_fields:['phone','address']}, incomplete).checks.missing.pass, true);
  assert.equal(scorer.scoreCase({...valid, missing_fields:['phone']}, incomplete).checks.missing.pass, false);
});

test('schema rejects unsupported, duplicate, and extra fields', () => {
  assert.equal(scorer.validateOutputSchema({...valid, missing_fields:['email']}).ok, false);
  assert.equal(scorer.validateOutputSchema({...valid, missing_fields:['phone','phone']}).ok, false);
  assert.equal(scorer.validateOutputSchema({...valid, surprise:true}).ok, false);
});

test('case_id is accepted only as an optional non-empty routing field', () => {
  assert.equal(scorer.validateOutputSchema({...valid, case_id:'demo-001'}).ok, true);
  assert.equal(scorer.validateOutputSchema({...valid, case_id:''}).ok, false);
});

test('invalid outputs fail safely at the JSON or schema check', () => {
  const malformed = scorer.scoreCase('not JSON', expected);
  assert.equal(malformed.pass, false);
  assert.deepEqual(Object.keys(malformed.checks), ['json']);

  const missingKey = scorer.scoreCase({trade:'hvac'}, expected);
  assert.equal(missingKey.pass, false);
  assert.equal(missingKey.score, 0);
  assert.deepEqual(Object.keys(missingKey.checks), ['json']);
});
