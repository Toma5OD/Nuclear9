import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { decodeTokenWith, signUserToken, userIdFromAuthHeader } from '../../src/api/jwt-core.js';

const secret = 'local-test-cookie-password-at-least-32-chars';
const user = { _id: '6528f1c2a4b3c9d0e1f23456', email: 'test@example.invalid' };
const bearer = token => `Bearer ${token}`;

test('accepts issued tokens and preserves identity', () => {
  const token = signUserToken(user, secret);
  assert.equal(userIdFromAuthHeader(bearer(token), secret), user._id);
  assert.deepEqual(decodeTokenWith(token, secret), { userId: user._id, email: user.email });
});
test('rejects a token signed by a different shared secret', () => {
  const token = jwt.sign({ id: user._id }, 'wrong-test-key', { algorithm: 'HS256' });
  assert.equal(userIdFromAuthHeader(bearer(token), secret), null);
  assert.deepEqual(decodeTokenWith(token, secret), {});
});
test('fails closed for missing configuration and malformed headers', () => {
  const token = signUserToken(user, secret);
  for (const value of [undefined, null, '', ' ']) {
    assert.equal(userIdFromAuthHeader(bearer(token), value), null);
    assert.throws(() => signUserToken(user, value), /not configured/);
  }
  for (const header of [undefined, null, '', 'Bearer', token, `Basic ${token}`, `Bearer ${token} extra`, [bearer(token)]]) {
    assert.equal(userIdFromAuthHeader(header, secret), null);
  }
});
test('rejects wrong algorithms and expired tokens', () => {
  const wrongAlgorithm = jwt.sign({ id: user._id }, secret, { algorithm: 'HS512' });
  const expired = jwt.sign({ id: user._id, exp: Math.floor(Date.now() / 1000) - 60 }, secret);
  const unsigned = jwt.sign({ id: user._id }, '', { algorithm: 'none' });
  for (const token of [wrongAlgorithm, expired, unsigned]) assert.equal(userIdFromAuthHeader(bearer(token), secret), null);
});
test('accepts UUID identities used by the JSON store, rejects invalid payloads', () => {
  const id = '123e4567-e89b-42d3-a456-426614174000';
  assert.equal(userIdFromAuthHeader(bearer(signUserToken({ _id: id }, secret)), secret), id);
  for (const payload of [{ id: 123 }, { id: '' }, { email: user.email }, 'plain']) {
    assert.equal(userIdFromAuthHeader(bearer(jwt.sign(payload, secret)), secret), null);
  }
});
