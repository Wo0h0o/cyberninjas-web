const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'page.tsx');

// Read as buffer to see actual bytes
const buffer = fs.readFileSync(filePath);
const content = buffer.toString('utf8');

// Find all potential Cyrillic corrupted strings (start with Ð)
const corrupted = content.match(/[ÐŸÐ°-яëÃ«]{3,}/g) || [];
console.log('Found corrupted strings:', corrupted.slice(0, 10));

// Complete mapping of ALL text that needs fixing
const textMap = {
    // Detect and replace any string containing Ð characters
    // Since we can't easily regex match, we'll do line-by-line replacement
};

// Exact replacements based on screenshots
const replacements = [
    // Header & Buttons
    ['Ð'Ð»ÐµÐ· Ð² Ð¿Ð»Ð°Ñ‚Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ð°', 'Влез в платформата'],

    // Subtitle
    ['Ð ÐµÑÑƒÑ€ÑÐ¸ Ð¸ Ð¿Ñ€Ð°ÐºÑ‚Ð¸Ñ‡Ð½Ð¸ ÐºÑƒÑ€ÑÐ¾Ð²Ðµ Ð·Ð° AI Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ð·Ð°Ñ†Ð¸Ñ', 'Ресурси и практични курсове за AI автоматизация'],

        // Section titles - these might already be fixed
        // ['ÐšÐ°ÐºÐ²Ð¾', 'Какво'],
        // ['Ð¿Ñ€ÐµÐ´Ð»Ð°Ð³Ð°Ð¼Ðµ', 'предлагаме'],

        // Card 1
        ['ÐŸÑ€Ð¾Ð¼Ð¿Ñ‚ Ð'Ð¸Ð±Ð»Ð¸Ð¾Ñ‚ÐµÐºÐ°', 'Промпт Библиотека'],
        ['Ð¡Ñ‚Ð¾Ñ‚Ð¸Ñ†Ð¸ Ð³Ð¾Ñ‚Ð¾Ð²Ð¸ Ð¿Ñ€Ð¾Ð¼Ð¿Ñ‚Ð¸ Ð·Ð° ChatGPT, Claude, Midjourney Ð¸ Ð´Ñ€ÑƒÐ³Ð¸ AI Ð¸Ð½ÑÑ‚Ñ€ÑƒÐ¼ÐµÐ½Ñ‚Ð¸', 'Стотици готови промпти за ChatGPT, Claude, Midjourney и други AI инструменти'],

            // Card 2
            ['Ð'Ð¸Ð´ÐµÐ¾ ÐšÑƒÑ€ÑÐ¾Ð²Ðµ', 'Видео Курсове'],
            ['ÐŸÑ€Ð°ÐºÑ‚Ð¸Ñ‡Ð½Ð¸ ÐºÑƒÑ€ÑÐ¾Ð²Ðµ Ð·Ð° AI Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ð·Ð°Ñ†Ð¸Ñ - Ð¾Ñ‚ Ð¾ÑÐ½Ð¾Ð²Ð¸Ñ‚Ðµ Ð´Ð¾ Ð½Ð°Ð¿Ñ€ÐµÐ´Ð½Ð°Ð»Ð¸ Ñ‚ÐµÑ…Ð½Ð¸ÐºÐ¸', 'Практични курсове за AI автоматизация - от основите до напреднали техники'],
                ['ÐœÐ¾Ð´ÑƒÐ»', 'Модул'],

                // Card 3
                ['Ð'ÐµÐ·Ð¿Ð»Ð°Ñ‚Ð½Ð¸ Ð ÐµÑÑƒÑ€ÑÐ¸', 'Безплатни Ресурси'],
                ['Ð¸Ð½ÑÑ‚Ñ€ÑƒÐ¼ÐµÐ½Ñ‚Ð¸ Ð·Ð° Ñ€Ð°Ð±Ð¾Ñ‚Ð° Ñ AI', 'инструменти за работа с AI'],
                    ['Ð'ÑÐ¸Ñ‡ÐºÐ¾ Ð±ÐµÐ·Ð¿Ð»Ð°Ñ‚Ð½Ð¾', 'Всичко безплатно'],

                    // CTA Section
                    ['Ð"Ð¾Ñ‚Ð¾Ð² Ð»Ð¸ ÑÐ¸ Ð´Ð°', 'Готов ли си да'],
                        ['Ð·Ð°Ð¿Ð¾Ñ‡Ð½ÐµÑˆ', 'започнеш'],
                        ['Ð ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð°Ð¹ ÑÐµ Ð±ÐµÐ·Ð¿Ð»Ð°Ñ‚Ð½Ð¾ Ð¸ Ð¿Ð¾Ð»ÑƒÑ‡Ð¸ Ð´Ð¾ÑÑ‚ÑŠÐ¿ Ð´Ð¾ Ð²ÑÐ¸Ñ‡ÐºÐ¸ Ñ€ÐµÑÑƒÑ€ÑÐ¸', 'Регистрирай се безплатно и получи достъп до всички ресурси'],
                        ['Ð¡ÑŠÐ·Ð´Ð°Ð¹ Ð°ÐºÐ°ÑƒÐ½Ñ‚', 'Създай акаунт'],

                        // Footer
                        ['Ð—Ð° Ð½Ð°Ñ', 'За нас'],
                        ['ÐŸÐ¾Ð²ÐµÑ€Ð¸Ñ‚ÐµÐ»Ð½Ð¾ÑÑ‚', 'Поверителност'],
                        ['Ð£ÑÐ»Ð¾Ð²Ð¸Ñ', 'Условия'],
                        ['ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚', 'Контакт'],
                        ['Ð'ÑÐ¸Ñ‡ÐºÐ¸ Ð¿Ñ€Ð°Ð²Ð° Ð·Ð°Ð¿Ð°Ð·ÐµÐ½Ð¸', 'Всички права запазени'],
                        ];

let fixed = content;
replacements.forEach(([bad, good]) => {
    const before = fixed;
    fixed = fixed.split(bad).join(good);
    if (before !== fixed) {
        console.log(`✅ Replaced: ${bad.substring(0, 20)}... → ${good}`);
    }
});

// Write back with explicit UTF-8
fs.writeFileSync(filePath, fixed, { encoding: 'utf8' });
console.log('\n✅ Complete encoding fix applied!');
