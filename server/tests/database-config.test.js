import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { apiResult, validateSupabaseEnvironment } from '../src/config/db.js';

test('Supabase configuration accepts HTTPS URL and server secret without a database URI', () => {
  const env = { SUPABASE_URL: 'https://example.supabase.co/', SUPABASE_SECRET_KEY: 'sb_secret_private_test', NODE_ENV: 'production' };
  assert.equal(validateSupabaseEnvironment(env).url, 'https://example.supabase.co');
  const legacy = 'header.' + Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url') + '.signature';
  assert.equal(validateSupabaseEnvironment({ ...env, SUPABASE_SECRET_KEY: '', SUPABASE_SERVICE_ROLE_KEY: legacy }).key, legacy);
});

test('Supabase configuration rejects public keys, missing credentials, and incorrect URLs', () => {
  const base = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_private_test', NODE_ENV: 'production' };
  for (const change of [
    { SUPABASE_URL: '' }, { SUPABASE_URL: 'postgresql://localhost/skids' },
    { SUPABASE_URL: 'http://example.supabase.co' }, { SUPABASE_URL: 'https://example.supabase.co/rest/v1' },
    { SUPABASE_SECRET_KEY: '' }, { SUPABASE_SECRET_KEY: 'sb_publishable_public' },
  ]) assert.throws(() => validateSupabaseEnvironment({ ...base, ...change }));
});

test('Supabase errors explain missing schema and keep credentials out of errors', () => {
  assert.throws(() => apiResult({ error: { code: 'PGRST202' } }), /server\/supabase\/setup.sql/);
  assert.throws(() => apiResult({ error: { code: '23505' } }), (error) => error.statusCode === 409);
  assert.throws(() => apiResult({ error: { code: '23514' } }), (error) => error.statusCode === 400);
  assert.throws(() => apiResult({ error: { code: '42501', message: 'private key content' } }), (error) => !error.message.includes('private key content'));
});

test('legacy migration command explains SQL Editor setup and checks Supabase configuration', () => {
  const result = spawnSync(process.execPath, ['server/src/config/migrate.js'], {
    cwd: fileURLToPath(new URL('../../', import.meta.url)), encoding: 'utf8', timeout: 10000,
    env: { ...process.env, SUPABASE_URL: '', SUPABASE_SECRET_KEY: '', SUPABASE_SERVICE_ROLE_KEY: '' },
  });
  assert.ifError(result.error);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Supabase SQL Editor/);
  assert.match(result.stderr, /SUPABASE_URL is required/);
  assert.doesNotMatch(result.stderr, /DATABASE_URL is required/);
});
