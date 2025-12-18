// Debug script to check env variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('=== ENV CHECK ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

// List all env vars that contain SUPABASE
console.log('\n=== ALL SUPABASE VARS ===');
Object.keys(process.env).filter(k => k.includes('SUPABASE')).forEach(k => {
    console.log(`${k}: ${process.env[k]?.substring(0, 20)}...`);
});
