/**
 * Script to auto-fill missing usage_tips and expected_result fields
 * Based on the description and prompt_text content
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate usage tips based on the prompt content
function generateUsageTips(title: string, description: string, promptText: string): string {
    const tips: string[] = [];

    // Common tips based on prompt type
    if (promptText.includes('[') && promptText.includes(']')) {
        tips.push('Заменете всички стойности в квадратни скоби [...] с вашите конкретни данни.');
    }

    if (promptText.toLowerCase().includes('act as')) {
        tips.push('Използвайте с GPT-4, Claude или друг мощен AI модел за най-добри резултати.');
    }

    if (title.includes('Solidity') || title.includes('Smart Contract') || promptText.includes('Solidity')) {
        tips.push('Винаги тествайте генерирания код в testnet преди deployment в mainnet.');
        tips.push('Проверете кода с инструменти като Slither или MythX за сигурност.');
    }

    if (title.includes('Trading') || title.includes('Trade') || description.includes('сделки')) {
        tips.push('Никога не инвестирайте повече, отколкото можете да си позволите да загубите.');
        tips.push('Използвайте резултатите като насока, не като финансов съвет.');
    }

    if (title.includes('Pine Script') || promptText.includes('Pine Script')) {
        tips.push('Тествайте стратегията в TradingView на исторически данни преди live trading.');
    }

    if (title.includes('DeFi') || title.includes('Staking') || description.includes('DeFi')) {
        tips.push('Разберете напълно рисковете преди взаимодействие с DeFi протоколи.');
    }

    if (tips.length === 0) {
        tips.push('Копирайте промпта и го поставете в предпочитания от вас AI асистент.');
        tips.push('Заменете placeholder стойностите с вашите реални данни.');
        tips.push('Прегледайте и адаптирайте резултата за вашите специфични нужди.');
    }

    return tips.join('\n');
}

// Generate expected result based on the prompt content
function generateExpectedResult(title: string, description: string, promptText: string): string {
    const results: string[] = [];

    if (promptText.includes('Solidity') || title.includes('Solidity')) {
        results.push('Готов Solidity код, който можете да компилирате и деплойнете.');
    }

    if (promptText.includes('Pine Script') || title.includes('Pine Script')) {
        results.push('Работещ Pine Script код за TradingView с коментари и документация.');
    }

    if (title.includes('Trading') || title.includes('Trade') || description.includes('анализ')) {
        results.push('Детайлен анализ с конкретни нива, рискове и препоръки.');
    }

    if (title.includes('Стратег') || description.includes('стратегия')) {
        results.push('Структуриран план за действие с ясни стъпки.');
    }

    if (promptText.includes('checklist') || title.includes('Чеклист')) {
        results.push('Готов чеклист, който можете да използвате директно.');
    }

    if (description.includes('генератор') || description.includes('Генерир')) {
        results.push('Множество варианти за избор и адаптиране към вашите нужди.');
    }

    if (results.length === 0) {
        results.push('Структуриран отговор с практически насоки.');
        results.push('Резултат, готов за директно приложение или адаптация.');
    }

    return results.join('\n');
}

async function autoFillMissingFields() {
    console.log('🔄 Auto-filling missing fields...\n');

    // Get prompts missing usage_tips OR expected_result
    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('id, title, description, prompt_text, usage_tips, expected_result')
        .or('usage_tips.is.null,expected_result.is.null');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${prompts?.length} prompts to update\n`);

    let updatedCount = 0;

    for (const prompt of prompts || []) {
        const updates: Record<string, string> = {};

        if (!prompt.usage_tips) {
            updates.usage_tips = generateUsageTips(
                prompt.title || '',
                prompt.description || '',
                prompt.prompt_text || ''
            );
        }

        if (!prompt.expected_result) {
            updates.expected_result = generateExpectedResult(
                prompt.title || '',
                prompt.description || '',
                prompt.prompt_text || ''
            );
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('prompts')
                .update(updates)
                .eq('id', prompt.id);

            if (!updateError) {
                console.log(`✅ Updated: ${prompt.title?.substring(0, 50)}...`);
                updatedCount++;
            } else {
                console.log(`❌ Failed: ${prompt.title} - ${updateError.message}`);
            }
        }
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} prompts.`);
}

autoFillMissingFields().catch(console.error);
