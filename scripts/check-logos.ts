import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLogos() {
    const { data, error } = await supabase
        .from('platforms')
        .select('name, url, logo_url')
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('First 5 platforms:');
        data.forEach(p => {
            console.log(`\n${p.name}:`);
            console.log(`  URL: ${p.url}`);
            console.log(`  Logo URL: ${p.logo_url || 'MISSING!'}`);
        });
    }
}

checkLogos();
