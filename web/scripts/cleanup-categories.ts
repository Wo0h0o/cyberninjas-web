/**
 * Script to clean up ALL duplicate categories (keeps only the one with most prompts)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDuplicates() {
    console.log('🧹 Cleaning up ALL duplicate categories...\n');

    // Get all categories with prompt count
    const { data: categories, error } = await supabase
        .from('prompt_categories')
        .select(`
            id,
            title,
            module_id,
            prompts (id)
        `);

    if (error) {
        console.error('Error fetching categories:', error.message);
        return;
    }

    // Group by module_id
    const moduleGroups: Record<string, typeof categories> = {};

    for (const cat of categories || []) {
        const key = cat.module_id;
        if (!moduleGroups[key]) moduleGroups[key] = [];
        moduleGroups[key].push(cat);
    }

    console.log(`Found ${Object.keys(moduleGroups).length} modules\n`);

    let deletedCount = 0;

    for (const [moduleId, cats] of Object.entries(moduleGroups)) {
        if (cats.length > 1) {
            // Sort by prompt count (descending) - keep the one with most prompts
            cats.sort((a, b) => (b.prompts?.length || 0) - (a.prompts?.length || 0));

            const keeper = cats[0];
            const toDelete = cats.slice(1);

            console.log(`\nModule ${moduleId}:`);
            console.log(`  ✅ Keeping: "${keeper.title}" (${keeper.prompts?.length || 0} prompts)`);

            for (const dup of toDelete) {
                // First, move any prompts from duplicate to keeper
                if (dup.prompts && dup.prompts.length > 0) {
                    const { error: moveError } = await supabase
                        .from('prompts')
                        .update({ category_id: keeper.id })
                        .eq('category_id', dup.id);

                    if (moveError) {
                        console.log(`  ⚠️ Failed to move prompts from ${dup.id}: ${moveError.message}`);
                        continue;
                    }
                    console.log(`  📦 Moved ${dup.prompts.length} prompts to keeper`);
                }

                // Now delete the duplicate category
                const { error: delError } = await supabase
                    .from('prompt_categories')
                    .delete()
                    .eq('id', dup.id);

                if (delError) {
                    console.log(`  ❌ Failed to delete ${dup.id}: ${delError.message}`);
                } else {
                    console.log(`  🗑️ Deleted duplicate: "${dup.title}" (had ${dup.prompts?.length || 0} prompts)`);
                    deletedCount++;
                }
            }
        }
    }

    console.log(`\n🎉 Cleanup complete! Deleted ${deletedCount} duplicate categories.`);
}

cleanupDuplicates().catch(console.error);
