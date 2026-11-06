import test from 'node:test';
import assert from 'node:assert/strict';
import { TtlCache } from './cache.js';

test('guarda e devolve valores', () => {
  const c = new TtlCache();
  c.set('a', 1, 1000);
  assert.equal(c.get('a'), 1);
});
test('expira depois do TTL', async () => {
  const c = new TtlCache();
  c.set('a', 1, 5);
  await new Promise(r => setTimeout(r, 20));
  assert.equal(c.get('a'), undefined);
});
test('remove a entrada mais antiga quando enche', () => {
  const c = new TtlCache(2);
  c.set('a', 1, 1000); c.set('b', 2, 1000); c.set('c', 3, 1000);
  assert.equal(c.get('a'), undefined);
  assert.equal(c.get('c'), 3);
});
