import test from 'node:test';
import assert from 'node:assert';
import { extractLocation, extractEmployeeRange } from './planner.service.js';

test('PlannerService Utilities', async (t) => {
  await t.test('extractLocation - basic near', () => {
    const res = extractLocation('Find SaaS companies near Bangalore with 20-100 employees');
    assert.strictEqual(res.city, 'Bangalore');
    assert.strictEqual(res.state, '');
  });

  await t.test('extractLocation - in city, state', () => {
    const res = extractLocation('Find tech companies in Amritapuri, Kerala with 50-200 employees');
    assert.strictEqual(res.city, 'Amritapuri');
    assert.strictEqual(res.state, 'Kerala');
  });

  await t.test('extractLocation - fallback', () => {
    const res = extractLocation('Find software companies');
    assert.strictEqual(res.city, 'India');
    assert.strictEqual(res.state, '');
  });

  await t.test('extractEmployeeRange - hyphen range', () => {
    const res = extractEmployeeRange('Find companies with 20-100 employees');
    assert.strictEqual(res.min, 20);
    assert.strictEqual(res.max, 100);
  });

  await t.test('extractEmployeeRange - to range', () => {
    const res = extractEmployeeRange('Find companies with 50 to 150 employees');
    assert.strictEqual(res.min, 50);
    assert.strictEqual(res.max, 150);
  });

  await t.test('extractEmployeeRange - more than', () => {
    const res = extractEmployeeRange('Find companies with more than 500 employees');
    assert.strictEqual(res.min, 500);
    assert.strictEqual(res.max, 1000);
  });
});
