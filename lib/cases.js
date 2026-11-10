(function (root, factory) {
  const cases = factory();
  if (typeof module === 'object' && module.exports) module.exports = cases;
  if (root) root.IntakeCases = cases;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const REQUIRED_FIELDS = ['name', 'phone', 'address', 'issue'];
  const TRADES = ['hvac', 'plumbing', 'unknown'];
  const INTENTS = ['emergency', 'quote', 'maintenance', 'ambiguous'];
  const URGENCIES = ['now', 'today', 'this_week', 'unspecified'];
  const EXPECTED_MATCHES = ['trade', 'intent', 'urgency', 'after_hours', 'in_service_area', 'photo_attached'];

  const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const isBooleanOrNull = (value) => value === true || value === false || value === null;
  const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

  function validateCase(value, index) {
    const at = Number.isInteger(index) ? 'case ' + (index + 1) : 'case';
    if (!isRecord(value)) return { ok: false, error: at + ' must be an object' };

    const requiredStrings = ['case_id', 'shop_name', 'channel', 'customer_message'];
    const missingString = requiredStrings.find((key) => !isNonEmptyString(value[key]));
    if (missingString) return { ok: false, error: at + ' needs a non-empty ' + missingString };
    if (!isRecord(value.form_fields)) return { ok: false, error: value.case_id + ': form_fields must be an object' };
    if (!TRADES.includes(value.trade)) return { ok: false, error: value.case_id + ': invalid trade' };
    if (!INTENTS.includes(value.intent)) return { ok: false, error: value.case_id + ': invalid intent' };
    if (!URGENCIES.includes(value.urgency)) return { ok: false, error: value.case_id + ': invalid urgency' };
    if (typeof value.after_hours !== 'boolean') return { ok: false, error: value.case_id + ': after_hours must be boolean' };
    if (!isBooleanOrNull(value.in_service_area)) return { ok: false, error: value.case_id + ': in_service_area must be boolean or null' };
    if (typeof value.photo_attached !== 'boolean') return { ok: false, error: value.case_id + ': photo_attached must be boolean' };
    if (typeof value.adversarial !== 'boolean') return { ok: false, error: value.case_id + ': adversarial must be boolean' };

    const expected = value.expected;
    if (!isRecord(expected)) return { ok: false, error: value.case_id + ': expected must be an object' };
    const mismatch = EXPECTED_MATCHES.find((key) => expected[key] !== value[key]);
    if (mismatch) return { ok: false, error: value.case_id + ': expected.' + mismatch + ' must match ' + mismatch };
    if (!Array.isArray(expected.required_fields_present)
      || expected.required_fields_present.some((field) => !REQUIRED_FIELDS.includes(field))
      || new Set(expected.required_fields_present).size !== expected.required_fields_present.length) {
      return { ok: false, error: value.case_id + ': expected.required_fields_present must contain unique supported fields' };
    }
    if (typeof expected.webhook_ready !== 'boolean') return { ok: false, error: value.case_id + ': expected.webhook_ready must be boolean' };
    const allPresent = REQUIRED_FIELDS.every((field) => expected.required_fields_present.includes(field));
    if (expected.webhook_ready !== allPresent) {
      return { ok: false, error: value.case_id + ': expected.webhook_ready must reflect required_fields_present' };
    }
    if (expected.follow_injection !== false) {
      return { ok: false, error: value.case_id + ': expected.follow_injection must be false' };
    }
    return { ok: true, value };
  }

  function validateCases(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return { ok: false, error: 'Case data must be a non-empty array' };
    }
    const ids = new Set();
    for (let index = 0; index < values.length; index += 1) {
      const result = validateCase(values[index], index);
      if (!result.ok) return result;
      if (ids.has(values[index].case_id)) return { ok: false, error: 'Duplicate case_id: ' + values[index].case_id };
      ids.add(values[index].case_id);
    }
    return { ok: true, value: values };
  }

  function parseJsonLines(text) {
    if (typeof text !== 'string') return { ok: false, error: 'JSONL input must be text' };
    const rows = [];
    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      if (!lines[index].trim()) continue;
      try {
        rows.push(JSON.parse(lines[index]));
      } catch (error) {
        return { ok: false, error: 'Invalid JSON on line ' + (index + 1) + ': ' + error.message };
      }
    }
    return validateCases(rows);
  }

  return { validateCase, validateCases, parseJsonLines, REQUIRED_FIELDS };
});
