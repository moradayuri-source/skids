import { createClient } from '@supabase/supabase-js';

export const validateSupabaseEnvironment = (env = process.env) => {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_SECRET_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url) throw new Error('SUPABASE_URL is required. Use the HTTPS Project URL from Supabase project settings.');
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('SUPABASE_URL must be a valid HTTPS Project URL.'); }
  const local = env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if ((parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:'))
    || parsed.username || parsed.password || !['', '/'].includes(parsed.pathname) || parsed.search || parsed.hash) {
    throw new Error('SUPABASE_URL must be the HTTPS Project URL without API paths, credentials, or query parameters.');
  }
  if (!key) throw new Error('SUPABASE_SECRET_KEY is required on the backend. A legacy SUPABASE_SERVICE_ROLE_KEY is also supported.');
  let legacyRole;
  try { legacyRole = JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString()).role; } catch { /* Not a legacy JWT key. */ }
  if (!key.startsWith('sb_secret_') && legacyRole !== 'service_role') {
    throw new Error('Use a Supabase secret key or legacy service_role key on the backend, not a publishable/anon key.');
  }
  return { url: parsed.origin, key };
};

let client;
let clientSettings;
export const getSupabase = () => {
  const settings = validateSupabaseEnvironment();
  if (!client || settings.url !== clientSettings.url || settings.key !== clientSettings.key) {
    client = createClient(settings.url, settings.key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init = {}) => fetch(input, {
          ...init,
          signal: init.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
            : AbortSignal.timeout(15000),
        }),
      },
    });
    clientSettings = settings;
  }
  return client;
};

export const apiResult = ({ data, error, count }) => {
  if (!error) return { data, count };
  const missingSchema = ['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code);
  const invalid = ['22P02', '22007', '22008', '22003', '23514', '23502', '23503', 'P0001'].includes(error.code);
  const conflict = error.code === '23505';
  const denied = ['42501', 'PGRST301', 'PGRST302'].includes(error.code);
  const failure = new Error(missingSchema
    ? 'Supabase schema is not installed. Run server/supabase/setup.sql in the Supabase SQL Editor, then run npm run db:check.'
    : error.code === '28000' ? 'This account is not active'
      : conflict ? 'A record with these unique details already exists'
      : invalid ? 'Invalid record data or reference'
        : denied ? 'Supabase denied the request. Check the backend secret key and schema permissions.'
          : 'Supabase Data API request failed. Check the Project URL, API key, and Data API settings.');
  failure.statusCode = missingSchema ? 503 : error.code === '28000' ? 403 : conflict ? 409 : invalid ? 400 : 502;
  failure.code = error.code;
  throw failure;
};

export const callRpc = async (name, parameters = {}) =>
  apiResult(await getSupabase().rpc(name, parameters)).data;

const connectDB = async () => {
  const status = await callRpc('skids_status');
  if (status?.version !== 1) throw new Error('Supabase schema version is unsupported. Apply server/supabase/setup.sql.');
  console.log('Supabase Data API connected');
  return getSupabase();
};
export default connectDB;
