/**
 * Script to list prompts with missing fields and generate AI-based content for them
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listMissingPrompts() {
    console.log('📋 Listing prompts with missing fields...\n');

    // Get prompts missing usage_tips OR expected_result
    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('id, title, description, prompt_text, usage_tips, expected_result')
        .or('usage_tips.is.null,expected_result.is.null');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${prompts?.length} prompts with missing fields:\n`);

    for (const prompt of prompts || []) {
        console.log(`\n=== ${prompt.title} ===`);
        console.log(`ID: ${prompt.id}`);
        console.log(`Description: ${prompt.description ? prompt.description.substring(0, 100) + '...' : 'MISSING'}`);
        console.log(`Prompt text: ${prompt.prompt_text ? prompt.prompt_text.substring(0, 100) + '...' : 'MISSING'}`);
        console.log(`Usage tips: ${prompt.usage_tips ? '✅' : '❌ MISSING'}`);
        console.log(`Expected result: ${prompt.expected_result ? '✅' : '❌ MISSING'}`);
    }
}

listMissingPrompts().catch(console.error);
