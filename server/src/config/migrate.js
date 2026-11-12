import 'dotenv/config';
import connectDB from './db.js';

console.log('Supabase schema setup: run server/supabase/setup.sql once in Supabase SQL Editor.');
console.log('Checking the installed schema through the Supabase Data API...');
try {
  await connectDB();
  console.log('Supabase schema is ready');
} catch (error) {
  console.error('Supabase setup check failed:', error.message);
  process.exitCode = 1;
}
