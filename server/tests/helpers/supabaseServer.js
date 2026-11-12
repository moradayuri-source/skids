// A small PostgREST-compatible HTTP fixture backed by real PostgreSQL (PGlite).
// This exercises the official Supabase SDK's HTTP requests and the setup RPCs.
import { createServer } from 'node:http';
import { once } from 'node:events';

export const testSecret = 'sb_secret_isolated_test_backend_key';
const tables = ['users', 'youth_profiles', 'announcements', 'events', 'budget_reports', 'documents', 'messages', 'message_replies', 'activity_logs'];
const quote = (name) => {
  if (!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(name)) throw new Error('Invalid SQL identifier in fixture');
  return '"' + name + '"';
};
const sqlValue = (value) => value && typeof value === 'object' ? JSON.stringify(value) : value;
const selections = (text) => text.split(/,(?![^()]*\))/).filter(Boolean);

export const startSupabaseServer = async (db, { maxRows = 1000 } = {}) => {
  const requests = [];
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
    requests.push({ method: req.method, path: url.pathname, select: url.searchParams.get('select') });
    try {
      const response = await db.transaction(async (transaction) => {
        await transaction.exec(req.headers.apikey === testSecret ? 'SET LOCAL ROLE service_role' : 'SET LOCAL ROLE anon');
        const name = url.pathname.split('/').at(-1);
        if (url.pathname.startsWith('/rest/v1/rpc/')) {
          if (!/^skids_[a-z_]+$/.test(name)) throw new Error('Unknown fixture RPC');
          const entries = Object.entries(body);
          const args = entries.map(([key], index) => quote(key) + ' => $' + (index + 1)).join(',');
          const { rows } = await transaction.query('SELECT public.' + quote(name) + '(' + args + ') AS result', entries.map(([, value]) => sqlValue(value)));
          return { data: rows[0].result };
        }
        if (!tables.includes(name)) throw Object.assign(new Error('Unknown table'), { code: '42P01' });
        const values = [];
        const bind = (value) => { values.push(sqlValue(value)); return '$' + values.length; };
        const filters = [];
        for (const [field, expression] of url.searchParams) {
          if (['select', 'order', 'limit', 'offset'].includes(field)) continue;
          const separator = expression.indexOf('.');
          const operator = expression.slice(0, separator);
          const value = expression.slice(separator + 1);
          if (operator === 'is' && value === 'null') filters.push(quote(field) + ' IS NULL');
          else {
            const operators = { eq: '=', neq: '<>', gte: '>=', lte: '<=' };
            if (!operators[operator]) throw new Error('Unsupported fixture filter');
            filters.push(quote(field) + ' ' + operators[operator] + ' ' + bind(value));
          }
        }
        const where = filters.length ? ' WHERE ' + filters.join(' AND ') : '';
        const select = selections(url.searchParams.get('select') || '*');
        const columns = select.filter((field) => !field.includes('('));
        const returning = columns.length ? columns.map((field) => field === '*' ? '*' : quote(field)).join(',') : '*';
        let result;
        let total;
        if (['GET', 'HEAD'].includes(req.method)) {
          if ((req.headers.prefer || '').includes('count=exact')) {
            total = Number((await transaction.query('SELECT count(*) AS count FROM public.' + quote(name) + where, values)).rows[0].count);
          }
          const order = (url.searchParams.get('order') || '').split(',').filter(Boolean).map((item) => {
            const [field, direction] = item.split('.');
            return quote(field) + (direction === 'desc' ? ' DESC' : ' ASC');
          });
          const offset = Number(url.searchParams.get('offset') || 0);
          const limit = Math.min(Number(url.searchParams.get('limit') || maxRows), maxRows);
          result = await transaction.query('SELECT ' + returning + ' FROM public.' + quote(name) + where
            + (order.length ? ' ORDER BY ' + order.join(',') : '')
            + ' LIMIT ' + limit + ' OFFSET ' + offset, values);
        } else if (req.method === 'POST') {
          const entries = Object.entries(body);
          result = await transaction.query('INSERT INTO public.' + quote(name) + ' (' + entries.map(([key]) => quote(key)).join(',')
            + ') VALUES (' + entries.map(([, value]) => bind(value)).join(',') + ') RETURNING ' + returning, values);
        } else if (req.method === 'PATCH') {
          const assignments = Object.entries(body).map(([key, value]) => quote(key) + ' = ' + bind(value));
          result = await transaction.query('UPDATE public.' + quote(name) + ' SET ' + assignments.join(',') + where + ' RETURNING ' + returning, values);
        } else if (req.method === 'DELETE') {
          result = await transaction.query('DELETE FROM public.' + quote(name) + where + ' RETURNING ' + returning, values);
        } else throw new Error('Unsupported fixture method');

        for (const row of result.rows) {
          for (const item of select) {
            if (item.startsWith('user:users!')) {
              row.user = row.userId ? (await transaction.query('SELECT "_id", avatar, name, email FROM public.users WHERE "_id"=$1', [row.userId])).rows[0] || null : null;
            }
            if (item === 'replies:message_replies(*)') {
              row.replies = (await transaction.query('SELECT * FROM public.message_replies WHERE "messageId"=$1 ORDER BY "createdAt", "_id"', [row._id])).rows;
            }
          }
        }
        if ((req.headers.accept || '').includes('application/vnd.pgrst.object+json')) {
          if (result.rows.length !== 1) throw Object.assign(new Error('Cannot coerce the result to a single JSON object'), { code: 'PGRST116', details: 'The result contains ' + result.rows.length + ' rows' });
          return { data: result.rows[0], total };
        }
        return { data: result.rows, total };
      });
      res.setHeader('Content-Type', 'application/json');
      if (response.total !== undefined) res.setHeader('Content-Range', '0-0/' + response.total);
      res.statusCode = req.method === 'POST' ? 201 : 200;
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(response.data));
    } catch (error) {
      res.statusCode = error.code === '23505' ? 409 : error.code === 'PGRST116' ? 406 : 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ code: error.code || 'FIXTURE', message: error.message, details: error.details || null }));
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    url: 'http://127.0.0.1:' + server.address().port, requests,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
};
