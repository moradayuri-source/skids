import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { startSupabaseServer, testSecret } from './helpers/supabaseServer.js';
import { OAuth2Client } from 'google-auth-library';

test('Supabase Data API, schema, and application regression checks', { timeout: 90000 }, async (t) => {
  // The SDK talks HTTP to an isolated PostgREST fixture backed by PostgreSQL.
  const db = await PGlite.create();
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
  const setupSql = await readFile(new URL('../supabase/setup.sql', import.meta.url), 'utf8');
  const socket = await startSupabaseServer(db, { maxRows: 137 });
  process.env.SUPABASE_URL = socket.url;
  process.env.SUPABASE_SECRET_KEY = testSecret;
  delete process.env.DATABASE_URL;
  process.env.JWT_SECRET = 'isolated-test-secret-at-least-32-characters';
  process.env.ADMIN_EMAILS = 'chairperson@example.test';
  process.env.ADMIN_BOOTSTRAP_PASSWORD = 'Chairperson-test-password';
  process.env.NODE_ENV = 'test';

  const { default: connectDB } = await import('../src/config/db.js');
  const { default: User } = await import('../src/models/User.js');
  const { default: YouthProfile } = await import('../src/models/YouthProfile.js');
  const { bootstrapAdminPassword } = await import('../src/utils/bootstrapAdmin.js');
  const { default: app } = await import('../src/app.js');
  let server;

  try {
    await db.exec(setupSql);
    await connectDB();
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const request = async (path, { method = 'GET', token, body, status = 200 } = {}) => {
      const response = await fetch(base + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body !== undefined && { body: JSON.stringify(body) }),
      });
      const data = await response.json();
      assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(data)}`);
      return data;
    };
    const registration = {
      email: 'youth@example.test', name: 'Youth Member', password: 'Youth-password-123',
      youthProfile: { age: 20, gender: 'Female', barangay: 'Masagui' },
    };
    let youthToken;
    let adminToken;

    await t.test('registration is atomic and unique; password hashes stay private', async () => {
      const result = await request('/auth/register', { method: 'POST', body: registration, status: 201 });
      youthToken = result.token;
      assert.equal(result.user.role, 'user');
      assert.match(result.user.id, /^[\da-f-]{36}$/i);
      assert.equal((await YouthProfile.findOne({ where: { userId: result.user.id } })).age, 20);
      assert.equal(JSON.stringify(result).includes('passwordHash'), false);
      await request('/auth/register', { method: 'POST', body: registration, status: 409 });
      await request('/auth/register', {
        method: 'POST', status: 400,
        body: { ...registration, email: 'invalid@example.test', youthProfile: { age: 12 } },
      });
      assert.equal(await User.count({ where: { email: 'invalid@example.test' } }), 0);
      await request('/auth/register', {
        method: 'POST', status: 403, body: { ...registration, email: 'officer@example.test', accountType: 'officer' },
      });
      const stored = await User.findOne({ where: { email: registration.email } });
      assert.equal(stored.passwordHash, undefined);
      const withPassword = await User.findById(stored._id, { includePassword: true });
      assert.match(withPassword.passwordHash, /^scrypt:/);
      assert.equal(JSON.stringify(withPassword).includes('passwordHash'), false);
    });

    await t.test('bootstrap is idempotent; login and role restrictions persist', async () => {
      await bootstrapAdminPassword();
      const before = await User.findOne({ where: { email: process.env.ADMIN_EMAILS }, includePassword: true });
      await bootstrapAdminPassword();
      const after = await User.findById(before._id, { includePassword: true });
      assert.equal(before.passwordHash, after.passwordHash);
      adminToken = (await request('/auth/login', {
        method: 'POST', body: { email: before.email, password: process.env.ADMIN_BOOTSTRAP_PASSWORD },
      })).token;
      await request('/auth/login', { method: 'POST', body: { email: registration.email, password: 'wrong' }, status: 401 });
      await request('/admin/youth', { status: 401 });
      await request('/admin/youth', { token: youthToken, status: 403 });
      assert.equal((await request('/auth/me', { token: youthToken })).user.email, registration.email);
      const youth = await request('/admin/youth', { token: adminToken });
      assert.equal(youth[0].user.email, registration.email);
      assert.equal(JSON.stringify(youth).includes('passwordHash'), false);
    });

    await t.test('profile JSON and youth row update together and roll back on validation failure', async () => {
      const profile = await request('/user/profile', {
        method: 'PUT', token: youthToken,
        body: { firstName: 'Updated', lastName: 'Youth', age: 21, gender: 'Female', registeredSkVoter: 'Yes', youthClassifications: ['In School Youth'] },
      });
      assert.equal(profile.name, 'Updated Youth');
      assert.deepEqual(profile.profile.youthClassifications, ['In School Youth']);
      const row = await YouthProfile.findOne({ where: { userId: profile.id } });
      assert.equal(row.age, 21);
      assert.equal(row.voterStatus, 'Registered');
      await request('/user/profile', { method: 'PUT', token: youthToken, body: { age: 12, firstName: 'Must Roll Back' }, status: 400 });
      assert.equal((await request('/user/profile', { token: youthToken })).name, 'Updated Youth');
    });

    await t.test('admin CRUD, decimal budgets, JSONB metadata, and public filters work', async () => {
      const modules = [
        { path: 'announcements', body: { title: 'Budget 100%_done', content: 'Published content' }, update: { status: 'Archived' } },
        { path: 'events', body: { title: 'Youth Assembly', date: new Date(Date.now() + 86400000).toISOString(), time: '10:00', location: 'Hall' }, update: { status: 'Completed' } },
        { path: 'budget', body: { title: 'Supplies', amount: 'PHP 1,234.56', category: 'Education', cloudinary: { secureUrl: 'https://example.test/report.pdf', publicId: 'report' } }, update: { status: 'Rejected' } },
        { path: 'documents', body: { title: 'Resolution', type: 'Resolution', status: 'Filed' } },
      ];
      for (const item of modules) {
        const created = await request('/admin/' + item.path, { method: 'POST', token: adminToken, body: item.body, status: 201 });
        const id = created._id || created.id;
        if (item.path === 'budget') {
          assert.equal(created.rawAmount, 1234.56);
          assert.equal(created.fileKey, 'report');
        }
        assert.equal((await request('/' + item.path, { token: youthToken })).length, 1);
        if (item.update) {
          await request('/admin/' + item.path + '/' + id, { method: 'PUT', token: adminToken, body: item.update });
          assert.equal((await request('/' + item.path, { token: youthToken })).length, 0);
        }
        await request('/admin/' + item.path + '/' + id, { method: 'DELETE', token: adminToken });
        assert.equal((await request('/admin/' + item.path, { token: adminToken })).length, 0);
      }
      const youth = await request('/admin/youth', { method: 'POST', token: adminToken, body: { name: 'Manual Youth', age: 18 }, status: 201 });
      await request('/admin/youth/' + youth._id, { method: 'PUT', token: adminToken, body: { name: 'Edited Youth', age: 19 } });
      await request('/admin/youth/' + youth._id, { method: 'DELETE', token: adminToken });
      await request('/admin/youth/not-a-uuid', { method: 'DELETE', token: adminToken, status: 400 });
      await request('/admin/youth/00000000-0000-4000-8000-000000000000', { method: 'DELETE', token: adminToken, status: 404 });
    });

    await t.test('message replies are ordered, private to the sender, and cascade on delete', async () => {
      const message = await request('/messages', { method: 'POST', token: youthToken, body: { subject: 'Question', message: 'Please help' }, status: 201 });
      assert.deepEqual(message.replies, []);
      await request('/admin/messages/' + message._id + '/reply', { method: 'POST', token: adminToken, body: { reply: '   ' }, status: 400 });
      assert.equal((await request('/messages', { token: youthToken }))[0].status, 'unread');
      for (const reply of ['First reply', 'Second reply']) {
        const updated = await request('/admin/messages/' + message._id + '/reply', { method: 'POST', token: adminToken, body: { reply } });
        assert.equal(updated.status, 'read');
      }
      const messages = await request('/messages', { token: youthToken });
      assert.deepEqual(messages[0].replies.map((reply) => reply.message), ['First reply', 'Second reply']);
      assert.equal((await request('/messages', { token: adminToken })).length, 0);
      await request('/admin/messages/' + message._id + '/read', { method: 'PUT', token: adminToken });
      await request('/admin/messages/' + message._id, { method: 'DELETE', token: adminToken });
      assert.equal((await db.query('SELECT count(*)::integer AS count FROM message_replies')).rows[0].count, 0);
    });

    await t.test('history supports literal search, date bounds, categories, and pagination', async () => {
      const history = await request('/admin/history?search=100%25_done&limit=1&actionType=create&resourceType=Announcement', { token: adminToken });
      assert.equal(history.pagination.total, 1);
      assert.equal(history.logs[0].details, 'Budget 100%_done');
      assert.ok(history.filters.resourceTypes.includes('Announcement'));
      const dates = await request('/admin/history?dateFrom=2000-01-01&dateTo=2100-01-01&limit=2&page=2', { token: adminToken });
      assert.equal(dates.logs.length, 2);
      assert.equal(dates.pagination.page, 2);
      const injection = await request('/admin/history?search=' + encodeURIComponent("' OR 1=1 --"), { token: adminToken });
      assert.equal(injection.pagination.total, 0);
    });

    await t.test('Google account linking, manager assignment, and chairperson permissions remain intact', async () => {
      // Only the external identity provider is stubbed; all persistence uses PostgreSQL.
      t.mock.method(OAuth2Client.prototype, 'verifyIdToken', async ({ idToken }) => ({
        getPayload: () => ({ email: idToken, sub: 'google-' + idToken, email_verified: true, name: 'Google User' }),
      }));
      process.env.GOOGLE_CLIENT_ID = 'test-client';
      await request('/admin/managers', { method: 'POST', token: adminToken, body: { email: 'manager@example.test', name: 'Manager' }, status: 201 });
      const manager = await request('/auth/google', { method: 'POST', body: { credential: 'manager@example.test' } });
      assert.equal(manager.user.role, 'manager');
      await request('/admin/youth', { token: manager.token });
      await request('/admin/managers', { token: manager.token, status: 403 });
      const linked = await request('/auth/google', { method: 'POST', body: { credential: registration.email } });
      assert.equal(linked.user.role, 'user');
      await request('/auth/login', { method: 'POST', body: { email: registration.email, password: registration.password } });
      assert.equal(await YouthProfile.count({ where: { userId: linked.user.id } }), 1);
      assert.equal((await request('/auth/google', { method: 'POST', body: { credential: process.env.ADMIN_EMAILS } })).user.role, 'admin');
      const newYouth = await request('/auth/google', { method: 'POST', body: { credential: 'new@example.test' } });
      assert.equal(newYouth.user.role, 'user');
      await request('/admin/managers/' + manager.user.id, { method: 'DELETE', token: adminToken });
      await request('/admin/youth', { token: manager.token, status: 403 });
      await User.updateById(linked.user.id, { status: 'suspended' });
      const blocked = await request('/auth/google', { method: 'POST', body: { credential: registration.email }, status: 403 });
      assert.equal(blocked.message, 'This account is not active');
      await User.updateById(linked.user.id, { status: 'active' });
    });

    await t.test('list requests page through Supabase row limits without dropping records', async () => {
      const { default: Announcement } = await import('../src/models/Announcement.js');
      const admin = await User.findOne({ where: { email: process.env.ADMIN_EMAILS } });
      await db.query(`INSERT INTO public.announcements (title, content, author, "authorName")
        SELECT 'Paging ' || value, 'Content', $1, 'Chairperson' FROM generate_series(1,1001) value`, [admin._id]);
      const all = await Announcement.findAll({ order: [['publishedAt', 'DESC']] });
      assert.equal(all.length, 1001);
      assert.equal(new Set(all.map((item) => item._id)).size, 1001);
      const limited = await Announcement.findAll({ limit: 150, offset: 20, order: [['_id', 'ASC']] });
      assert.equal(limited.length, 150);
    });

    await t.test('SQL constraints reject orphan records and migrations can rerun without data loss', async () => {
      await assert.rejects(db.query(`INSERT INTO youth_profiles ("_id", "userId", name)
        VALUES ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Orphan')`), /foreign key/i);
      const count = await User.count();
      await db.exec(setupSql);
      await connectDB();
      assert.equal(await User.count(), count);
      assert.ok(socket.requests.some((request) => request.path === '/rest/v1/rpc/skids_register'));
      assert.ok(socket.requests.some((request) => request.path === '/rest/v1/rpc/skids_history'));
      assert.ok(socket.requests.filter((request) => request.path === '/rest/v1/users' && request.method === 'GET')
        .some((request) => !request.select.includes('passwordHash')));
      await assert.rejects(db.transaction(async (transaction) => {
        await transaction.exec('SET LOCAL ROLE anon');
        await transaction.query('SELECT * FROM public.users');
      }), /permission denied/i);
      await assert.rejects(db.transaction(async (transaction) => {
        await transaction.exec('SET LOCAL ROLE authenticated');
        await transaction.query("SELECT public.skids_register('{}','{}')");
      }), /permission denied/i);
      await assert.rejects(db.transaction(async (transaction) => {
        await transaction.exec('SET LOCAL ROLE anon');
        await transaction.query('SELECT public.skids_status()');
      }), /permission denied/i);
    });
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await socket.close();
    await db.close();
  }
});
