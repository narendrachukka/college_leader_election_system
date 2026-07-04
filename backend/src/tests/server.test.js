import test from 'node:test';
import assert from 'node:assert/strict';
import { getLoginIdentifier } from '../auth.js';

test('backend package can be loaded', () => {
  assert.equal(typeof process.versions.node, 'string');
});

test('login identifier resolves from loginId, username, or rollNumber', () => {
  assert.equal(getLoginIdentifier({ loginId: 'admin' }), 'admin');
  assert.equal(getLoginIdentifier({ username: 'admin' }), 'admin');
  assert.equal(getLoginIdentifier({ rollNumber: '2023001' }), '2023001');
});
