import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import Cookie from '@hapi/cookie';
import HapiAuthJwt2 from 'hapi-auth-jwt2';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'node:fs';
import { signUserToken } from '../../src/api/jwt-core.js';
const SECRET = 'smoke-test-cookie-password-at-least-32-chars';
const USER = { _id: '6528f1c2a4b3c9d0e1f23456', email: 'fixture@example.invalid' };
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));
let server;
before(async () => {
  server = Hapi.server({ port: 0 });
  const plugins = [Inert, Vision, Cookie, HapiAuthJwt2];
  if (pkg.dependencies['hapi-swagger']) {
    const { default: swagger } = await import('hapi-swagger');
    plugins.push({ plugin: swagger, options: { info: { title: 'Smoke', version: '0.0.0' } } });
  }
  await server.register(plugins);
  server.auth.strategy('session', 'cookie', {
    cookie: { name: 'smoke', password: SECRET, isSecure: false },
    validateFunc: async () => ({ valid: false }),
  });
  server.auth.strategy('jwt', 'jwt', {
    key: SECRET, verifyOptions: { algorithms: ['HS256'] },
    validate: async (decoded) => ({ isValid: typeof decoded.id === 'string', credentials: { id: decoded.id } }),
  });
  server.route([
    { method: 'GET', path: '/api/whoami', options: { auth: 'jwt', tags: ['api'], handler: (request) => ({ id: request.auth.credentials.id }) } },
    { method: 'GET', path: '/session', options: { auth: 'session', handler: () => 'ok' } },
  ]);
  await server.initialize();
});
after(() => server?.stop());
const whoami = (headers = {}) => server.inject({ method: 'GET', url: '/api/whoami', headers });
const bearer = (token) => ({ authorization: `Bearer ${token}` });
test('JWT route accepts a valid HS256 token', async () => {
  const res = await whoami(bearer(signUserToken(USER, SECRET)));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.payload), { id: USER._id });
});
test('JWT route rejects wrong key, algorithm and missing token', async () => {
  const wrongKey = jwt.sign({ id: USER._id }, 'different-fixture-key', { algorithm: 'HS256' });
  const hs512 = jwt.sign({ id: USER._id }, SECRET, { algorithm: 'HS512' });
  assert.equal((await whoami(bearer(wrongKey))).statusCode, 401);
  assert.equal((await whoami(bearer(hs512))).statusCode, 401);
  assert.equal((await whoami()).statusCode, 401);
});
test('cookie strategy rejects a request without a session', async () => {
  assert.equal((await server.inject('/session')).statusCode, 401);
});
if (pkg.dependencies['hapi-swagger']) test('Swagger serves registered API spec and documentation', async () => {
  const spec = await server.inject('/swagger.json');
  assert.equal(spec.statusCode, 200);
  assert.ok(JSON.parse(spec.payload).paths['/api/whoami']);
  assert.equal((await server.inject('/documentation')).statusCode, 200);
});
