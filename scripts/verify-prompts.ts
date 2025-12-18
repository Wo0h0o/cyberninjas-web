/**
 * Script to verify prompt data completeness
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPrompts() {
    console.log('🔍 Verifying prompt data completeness...\n');

    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('id, title, description, prompt_text, usage_tips, expected_result')
        .limit(10);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Checking first 10 prompts:\n`);

    for (const prompt of prompts || []) {
        console.log(`📝 ${prompt.title}`);
        console.log(`   description: ${prompt.description ? '✅ ' + prompt.description.substring(0, 50) + '...' : '❌ MISSING'}`);
        console.log(`   prompt_text: ${prompt.prompt_text ? '✅ ' + prompt.prompt_text.substring(0, 50) + '...' : '❌ MISSING'}`);
        console.log(`   usage_tips: ${prompt.usage_tips ? '✅ ' + prompt.usage_tips.substring(0, 50) + '...' : '❌ MISSING'}`);
        console.log(`   expected_result: ${prompt.expected_result ? '✅ ' + prompt.expected_result.substring(0, 50) + '...' : '❌ MISSING'}`);
        console.log('');
    }

    // Count prompts with missing fields
    const { data: allPrompts } = await supabase
        .from('prompts')
        .select('description, usage_tips, expected_result');

    const missingDesc = allPrompts?.filter(p => !p.description).length || 0;
    const missingTips = allPrompts?.filter(p => !p.usage_tips).length || 0;
    const missingResult = allPrompts?.filter(p => !p.expected_result).length || 0;

    console.log('📊 Summary:');
    console.log(`   Total prompts: ${allPrompts?.length}`);
    console.log(`   Missing description: ${missingDesc}`);
    console.log(`   Missing usage_tips: ${missingTips}`);
    console.log(`   Missing expected_result: ${missingResult}`);
}

verifyPrompts().catch(console.error);
