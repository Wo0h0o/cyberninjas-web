/**
 * Script to UPDATE existing prompts with missing fields
 * Re-parses the txt files and updates prompts that are missing usage_tips or expected_result
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ParsedPrompt {
    number: number;
    title: string;
    description: string;
    tips: string;
    promptText: string;
    context: string;
    howToUse: string;
}

function parsePromptLibrary(content: string): ParsedPrompt[] {
    const prompts: ParsedPrompt[] = [];

    // Normalize line endings to LF
    const normalizedContent = content.replace(/\r\n/g, '\n');

    // Split by --- separator
    const sections = normalizedContent.split(/\n---\n/).filter(s => s.trim());

    for (const section of sections) {
        if (!section.trim()) continue;

        // Extract prompt number and title
        const titleMatch = section.match(/###\s+(\d+)\.\s+(.+?)(?:\n|$)/);
        if (!titleMatch) continue;

        const number = parseInt(titleMatch[1]);
        const title = titleMatch[2].trim();

        // Extract description (🎯 section) - more flexible regex
        const descMatch = section.match(/\*\*🎯[^\n]*\*\*[:\s]*\n([\s\S]*?)(?=\*\*💡|\*\*💻|📝|🚀|$)/);
        const description = descMatch ? cleanMarkdown(descMatch[1]) : '';

        // Extract tips (💡 section) - more flexible regex
        const tipsMatch = section.match(/\*\*💡[^\n]*\*\*[:\s]*\n([\s\S]*?)(?=\*\*💻|📝|🚀|```|$)/);
        const tips = tipsMatch ? cleanMarkdown(tipsMatch[1]) : '';

        // Extract prompt text (inside ``` blocks)
        const promptMatch = section.match(/```(?:text)?\s*\n([\s\S]*?)```/);
        const promptText = promptMatch ? promptMatch[1].trim() : '';

        // Extract how to use (📝 section) - more flexible regex
        const howToUseMatch = section.match(/📝[^\n]*(?:\*\*[^\n]*\*\*)?[:\s]*\n([\s\S]*?)(?=🚀|---|$)/);
        const howToUse = howToUseMatch ? cleanMarkdown(howToUseMatch[1]) : '';

        // Extract context (🚀 section) - capture everything after
        const contextMatch = section.match(/🚀[^\n]*(?:\*\*[^\n]*\*\*)?[:\s]*\n?([\s\S]*?)(?=---|$)/);
        const context = contextMatch ? cleanMarkdown(contextMatch[1]).trim() : '';

        prompts.push({
            number,
            title,
            description,
            tips,
            promptText,
            context,
            howToUse
        });
    }

    return prompts;
}

function cleanMarkdown(text: string): string {
    return text
        .replace(/^\s*\*\s*/gm, '')
        .replace(/\*\*/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
}

async function updatePrompts() {
    console.log('🔄 Updating prompts with missing fields...\n');

    const contentDir = path.join(__dirname, '../Content');
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.txt'));

    let updatedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        console.log(`\n📄 Processing: ${file}`);
        const content = fs.readFileSync(path.join(contentDir, file), 'utf-8');
        const parsed = parsePromptLibrary(content);

        for (const prompt of parsed) {
            // Find matching prompt in database by title
            const { data: existingPrompts, error: findError } = await supabase
                .from('prompts')
                .select('id, title, usage_tips, expected_result')
                .ilike('title', prompt.title.substring(0, 40) + '%');

            if (findError || !existingPrompts?.length) {
                continue;
            }

            for (const existing of existingPrompts) {
                const needsUpdate = !existing.usage_tips || !existing.expected_result;

                if (needsUpdate) {
                    const updates: Record<string, string> = {};

                    if (!existing.usage_tips && (prompt.tips || prompt.howToUse)) {
                        updates.usage_tips = prompt.tips + (prompt.howToUse ? '\n\n' + prompt.howToUse : '');
                    }

                    if (!existing.expected_result && prompt.context) {
                        updates.expected_result = prompt.context;
                    }

                    if (Object.keys(updates).length > 0) {
                        const { error: updateError } = await supabase
                            .from('prompts')
                            .update(updates)
                            .eq('id', existing.id);

                        if (!updateError) {
                            console.log(`   ✅ Updated: ${existing.title.substring(0, 40)}...`);
                            updatedCount++;
                        }
                    }
                } else {
                    skippedCount++;
                }
            }
        }
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} prompts. Skipped ${skippedCount} (already complete).`);
}

updatePrompts().catch(console.error);
