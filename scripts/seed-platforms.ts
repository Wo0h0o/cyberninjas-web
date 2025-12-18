import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Platform {
    name: string;
    description: string;
    category: 'text' | 'image' | 'video' | 'audio' | 'code' | 'research' | 'automation' | 'productivity' | 'other';
    type: 'website' | 'software' | 'extension';
    url: string;
    icon: string;
    logo_url?: string; // Clearbit Logo API URL
    features: string[];
    is_featured: boolean;
    order_index: number;
}

// Helper function to generate logo URL using Google Favicon API
// (Less likely to be blocked by ad blockers than Clearbit)
function getLogoUrl(url: string): string {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');

        // Extract root domain (e.g., google.com from aistudio.google.com)
        const parts = hostname.split('.');
        const rootDomain = parts.length >= 2
            ? parts.slice(-2).join('.')
            : hostname;

        // Google Favicon API with size=128 for better quality
        return `https://www.google.com/s2/favicons?domain=${rootDomain}&sz=128`;
    } catch {
        return '';
    }
}


const platforms: Platform[] = [
    // ======================
    // WEBSITES - TEXT/AI CHAT
    // ======================
    {
        name: 'Google AI Studio (Gemini)',
        description: 'Най-мощната платформа на Google за работа с AI модели. Предлага достъп до Gemini с огромен context window и multimodal capabilities.',
        category: 'text',
        type: 'website',
        url: 'https://aistudio.google.com',
        icon: 'Bot',
        features: ['2M tokens context window', 'Multimodal AI', 'Free tier налично', 'Code generation'],
        is_featured: true,
        order_index: 10
    },
    {
        name: 'ChatGPT (OpenAI)',
        description: 'Най-популярният AI чатбот в света. GPT-4 предлага изключителни capabilities за разговор, анализ и генериране на съдържание.',
        category: 'text',
        type: 'website',
        url: 'https://chat.openai.com',
        icon: 'Sparkles',
        features: ['GPT-4o модел', 'DALL-E 3 интеграция', 'Web browsing', 'Custom GPTs'],
        is_featured: true,
        order_index: 20
    },
    {
        name: 'Claude (Anthropic)',
        description: 'AI асистент с фокус върху безопасност и дълги контексти. Отличен за писане, анализ и complex reasoning.',
        category: 'text',
        type: 'website',
        url: 'https://claude.ai',
        icon: 'Brain',
        features: ['200K context window', 'Constitutional AI', 'PDF analysis', 'Advanced reasoning'],
        is_featured: true,
        order_index: 30
    },
    {
        name: 'Copy.ai',
        description: 'Платформа за мащабиране на маркетингово съдържание и автоматизация на търговски процеси.',
        category: 'text',
        type: 'website',
        url: 'https://www.copy.ai/',
        icon: 'FileText',
        features: ['Workflows автоматизация', 'Brand Voice', '90+ копирайтинг шаблона', 'CRM интеграция'],
        is_featured: false,
        order_index: 35
    },

    // ======================
    // WEBSITES - IMAGE
    // ======================
    {
        name: 'Midjourney',
        description: 'Водещата платформа за AI генериране на изображения. Създава невероятно артистични и детайлни визуализации.',
        category: 'image',
        type: 'website',
        url: 'https://midjourney.com',
        icon: 'Image',
        features: ['Photorealistic images', 'Artistic styles', 'High resolution', 'Community gallery'],
        is_featured: true,
        order_index: 40
    },
    {
        name: 'Freepik (AI Suite)',
        description: 'Пълен пакет от дизайнерски AI инструменти, интегрирани в стокова библиотека.',
        category: 'image',
        type: 'website',
        url: 'https://www.freepik.com/',
        icon: 'Palette',
        features: ['AI Image Generator', 'Sketch-to-Image', 'Background removal', 'Милиони стокови активи'],
        is_featured: false,
        order_index: 45
    },

    // ======================
    // WEBSITES - VIDEO
    // ======================
    {
        name: 'Veo 2 (Google)',
        description: 'Революционен AI модел за генериране на високо-качествено видео съдържание. Създава реалистични видеа от текстови описания.',
        category: 'video',
        type: 'website',
        url: 'https://deepmind.google/technologies/veo/veo-2/',
        icon: 'Video',
        features: ['4K видео качество', 'Реалистични движения', 'Text-to-video', 'Дълги клипове'],
        is_featured: true,
        order_index: 50
    },
    {
        name: 'Runway ML',
        description: 'Креативна платформа за AI видео editing и генериране. Предлага advanced tools за visual effects и видео manipulation.',
        category: 'video',
        type: 'website',
        url: 'https://runwayml.com',
        icon: 'Zap',
        features: ['Gen-3 Alpha модел', 'Motion Brush', 'Inpainting', 'Frame Interpolation'],
        is_featured: false,
        order_index: 55
    },
    {
        name: 'HeyGen',
        description: 'Платформа за създаване на реалистични AI видео аватари. Перфектна за маркетинг видеа, обучения и презентации.',
        category: 'video',
        type: 'website',
        url: 'https://heygen.com',
        icon: 'UserSquare2',
        features: ['Instant Avatars', 'Video Translation', '300+ готови аватара', 'Canva интеграция'],
        is_featured: true,
        order_index: 60
    },
    {
        name: 'OpusClip',
        description: 'AI инструмент за превръщане на дълги видеа в кратки, ангажиращи клипове за социалните мрежи.',
        category: 'video',
        type: 'website',
        url: 'https://www.opus.pro/',
        icon: 'Scissors',
        features: ['AI Virality Score', 'Active Speaker Detection', 'Динамични субтитри', '1-click към TikTok/Reels'],
        is_featured: false,
        order_index: 62
    },
    {
        name: 'Revid AI',
        description: 'Платформа за създаване на "faceless" канали чрез автоматизирано генериране на видео от текст.',
        category: 'video',
        type: 'website',
        url: 'https://www.revid.ai/',
        icon: 'Film',
        features: ['Script-to-Video', 'Стокови кадри', 'AI Voiceover', 'Автоматични субтитри'],
        is_featured: false,
        order_index: 64
    },
    {
        name: 'InVideo AI',
        description: 'Платформа, която позволява създаването и редактирането на видеа чрез чат команди.',
        category: 'video',
        type: 'website',
        url: 'https://invideo.io/',
        icon: 'MessageSquare',
        features: ['Magic Box (редакция чрез текст)', 'AI Script Generator', '8M+ стокови медии', 'Глас клониране'],
        is_featured: false,
        order_index: 66
    },
    {
        name: 'Hailuo AI',
        description: 'Мощен видео генератор, фокусиран върху сложни движения и кинематография.',
        category: 'video',
        type: 'website',
        url: 'https://hailuoai.video/',
        icon: 'Clapperboard',
        features: ['MiniMax модел', 'Дълги последователни кадри', 'Високо детайлни текстури', 'Симулация на физика'],
        is_featured: false,
        order_index: 68
    },
    {
        name: 'Luma Dream Machine',
        description: 'Бърз AI генератор за създаване на висококачествени, реалистични 5-секундни клипове.',
        category: 'video',
        type: 'website',
        url: 'https://lumalabs.ai/dream-machine',
        icon: 'Sparkles',
        features: ['Бърза генерация (под 120 сек.)', 'Seamless loops', 'Фотореалистично', 'Keyframe контрол'],
        is_featured: false,
        order_index: 70
    },
    {
        name: 'Akool',
        description: 'Платформа за професионален face swap и персонализирани видео кампании.',
        category: 'video',
        type: 'website',
        url: 'https://akool.com/',
        icon: 'UserCog',
        features: ['4K Face Swap', 'Multicultural avatars', 'Smart Lip-sync', 'Enterprise API'],
        is_featured: false,
        order_index: 72
    },
    {
        name: 'DeepSwap',
        description: 'Специализиран уеб инструмент за прецизна замяна на лица във видео и снимки.',
        category: 'video',
        type: 'website',
        url: 'https://www.deepswap.ai/',
        icon: 'Repeat',
        features: ['Мулти-фейс поддръжка', 'Бърза обработка', 'Без воден знак (премиум)', 'Висока резолюция'],
        is_featured: false,
        order_index: 74
    },

    // ======================
    // WEBSITES - AUDIO
    // ======================
    {
        name: 'ElevenLabs',
        description: 'Най-добрата платформа за AI voice generation. Създава изключително реалистични гласове на различни езици.',
        category: 'audio',
        type: 'website',
        url: 'https://elevenlabs.io',
        icon: 'Mic',
        features: ['Voice Cloning', 'Speech-to-Speech', 'AI Sound Effects', '29 езика'],
        is_featured: true,
        order_index: 80
    },
    {
        name: 'Suno AI',
        description: 'Революционна платформа за генериране на музика. Създава цели песни с вокали и инструментал само от текстов промпт.',
        category: 'audio',
        type: 'website',
        url: 'https://suno.com',
        icon: 'Music',
        features: ['Full song generation', 'Vocals & Lyrics', 'Multiple styles', 'Radio quality'],
        is_featured: true,
        order_index: 85
    },

    // ======================
    // WEBSITES - RESEARCH
    // ======================
    {
        name: 'NotebookLM',
        description: 'AI асистент, който превръща вашите документи в интерактивна база знания. Идеален за research и анализ.',
        category: 'research',
        type: 'website',
        url: 'https://notebooklm.google.com',
        icon: 'BookOpen',
        features: ['Document analysis', 'Audio overview', 'Source citations', 'Multimodal input'],
        is_featured: true,
        order_index: 90
    },
    {
        name: 'Perplexity AI',
        description: 'AI търсачка с real-time интернет достъп. Предоставя точни отговори с цитати и верификация на източниците.',
        category: 'research',
        type: 'website',
        url: 'https://perplexity.ai',
        icon: 'Search',
        features: ['Real-time web search', 'Source citations', 'Pro search mode', 'Academic papers'],
        is_featured: true,
        order_index: 95
    },

    // ======================
    // WEBSITES - PRODUCTIVITY
    // ======================
    {
        name: 'Gamma',
        description: 'Нов формат за създаване на презентации и уеб страници само чрез текст.',
        category: 'productivity',
        type: 'website',
        url: 'https://gamma.app/',
        icon: 'Presentation',
        features: ['One-click редизайн', 'Интерактивни карти', 'Responsive layouts', 'AI асистент за слайдове'],
        is_featured: false,
        order_index: 100
    },
    {
        name: 'Clay',
        description: 'Най-мощният инструмент за обогатяване на данни и персонализиран аутрич.',
        category: 'automation',
        type: 'website',
        url: 'https://www.clay.com/',
        icon: 'Database',
        features: ['150+ източника на данни', 'AI персонализация на имейли', 'Lead скоринг', 'CRM интеграция'],
        is_featured: false,
        order_index: 105
    },

    // ======================
    // SOFTWARE - CODE
    // ======================
    {
        name: 'Cursor',
        description: 'AI code editor, базиран на VS Code. Вграден AI чат, който вижда целия проект, auto-fix, и generation. Най-добрият инструмент за програмисти.',
        category: 'code',
        type: 'software',
        url: 'https://cursor.sh',
        icon: 'Terminal',
        features: ['Codebase awareness', 'GPT-4 / Claude Opus', 'Auto-debug', 'VS Code compatible'],
        is_featured: true,
        order_index: 200
    },
    {
        name: 'GitHub Copilot',
        description: 'AI coding асистент, който помага директно в редактора. Предлага допълване на код в реално време.',
        category: 'code',
        type: 'software',
        url: 'https://github.com/features/copilot',
        icon: 'Github',
        features: ['Code completion', 'Chat in IDE', 'Test generation', 'Multi-language'],
        is_featured: false,
        order_index: 210
    },
    {
        name: 'LM Studio',
        description: 'Работете с LLM модели (Llama 3, Mistral) ЛОКАЛНО на вашия компютър. Без такси, без интернет, пълна поверителност.',
        category: 'code',
        type: 'software',
        url: 'https://lmstudio.ai',
        icon: 'Cpu',
        features: ['Local execution', 'Offline privacy', 'HuggingFace support', 'OpenAI API compatible'],
        is_featured: true,
        order_index: 220
    },

    // ======================
    // SOFTWARE - PRODUCTIVITY
    // ======================
    {
        name: 'Notion',
        description: 'Unify your notes, wiki, and projects. Notion AI помага с писане, обобщаване и генериране на идеи директно в работното поле.',
        category: 'productivity',
        type: 'software',
        url: 'https://notion.so',
        icon: 'FileText',
        features: ['AI Writer', 'Summarization', 'Q&A your docs', 'Project management'],
        is_featured: true,
        order_index: 230
    },
    {
        name: 'Obsidian',
        description: 'Тетрадка за "втория мозък". С AI плъгини (като Text Generator) става мощна среда за генериране на свързани идеи.',
        category: 'productivity',
        type: 'software',
        url: 'https://obsidian.md',
        icon: 'Network',
        features: ['Local files', 'Graph view', 'Community plugins', 'Markdown'],
        is_featured: false,
        order_index: 240
    },
    {
        name: 'Descript',
        description: 'All-in-one видео и аудио редактор. Редактирайте видеото като текстов документ.',
        category: 'video',
        type: 'software',
        url: 'https://descript.com',
        icon: 'Scissors',
        features: ['Overdub (Voice Clone)', 'Studio Sound', 'Transcription editing', 'Screen recording'],
        is_featured: true,
        order_index: 250
    },

    // ======================
    // SOFTWARE - AUTOMATION
    // ======================
    {
        name: 'Zapier',
        description: 'Лидерът в автоматизацията. Свържете вашите на AI инструменти с хиляди други приложения без код.',
        category: 'automation',
        type: 'software',
        url: 'https://zapier.com',
        icon: 'Workflow',
        features: ['5000+ Apps', 'No-code automation', 'AI Actions', 'Multi-step zaps'],
        is_featured: false,
        order_index: 260
    },

    // ======================
    // BROWSER EXTENSIONS
    // ======================
    {
        name: 'Harpa AI',
        description: 'Hybrid AI Agent за Chrome. Следи цени, резюмира уебсайтове, пише отговори на мейли и автоматизира уеб задачи.',
        category: 'productivity',
        type: 'extension',
        url: 'https://harpa.ai',
        icon: 'Bot',
        features: ['Web Monitor', 'Page Summarizer', 'Email Writer', 'No login required'],
        is_featured: true,
        order_index: 300
    },
    {
        name: 'Grammarly',
        description: 'Вашият AI редактор. Поправя граматика, стил и тон в реално време, където и да пишете.',
        category: 'text',
        type: 'extension',
        url: 'https://grammarly.com',
        icon: 'PenTool',
        features: ['Grammar check', 'Tone suggestions', 'Plagiarism check', 'AI rewrite'],
        is_featured: false,
        order_index: 310
    },
    {
        name: 'Perplexity Companion',
        description: 'Официалното разширение на Perplexity. Задавайте въпроси директно докато четете статия и получете резюме.',
        category: 'research',
        type: 'extension',
        url: 'https://chromewebstore.google.com/detail/perplexity-companion/hlgbcneelhuinpkjolmfelkicnjeajoe',
        icon: 'Search',
        features: ['Page context', 'Instant summary', 'Follow-up questions', 'Citations'],
        is_featured: false,
        order_index: 320
    },
    {
        name: 'Monica',
        description: 'Вашият AI copilot. Чат с GPT-4, Claude и Gemini във всяка уеб страница. Превод, писане и резюмиране.',
        category: 'productivity',
        type: 'extension',
        url: 'https://monica.im',
        icon: 'MessageSquare',
        features: ['All models access', 'Sidebar chat', 'PDF Chat', 'Youtube summary'],
        is_featured: true,
        order_index: 330
    },
    {
        name: 'Fireflies.ai',
        description: 'AI асистент за срещи. Записва, транскрибира и търси във вашите гласови разговори от браузъра.',
        category: 'productivity',
        type: 'extension',
        url: 'https://fireflies.ai',
        icon: 'Mic',
        features: ['Auto-join meetings', 'Transcription', 'AI Summaries', 'Action items'],
        is_featured: false,
        order_index: 340
    },
    {
        name: 'Bardeen',
        description: 'Разширение за браузър, което автоматизира повтарящи се задачи директно в уеб страниците.',
        category: 'automation',
        type: 'extension',
        url: 'https://www.bardeen.ai/',
        icon: 'Zap',
        features: ['One-click data extraction', 'AI Magic Box', 'LinkedIn/Notion интеграция', 'Контекстно четене'],
        is_featured: false,
        order_index: 350
    }
];

async function seedPlatforms() {
    console.log('🌱 Seeding platforms...');

    // Add logo_url to all platforms using Google Favicon API
    const platformsWithLogos = platforms.map(platform => ({
        ...platform,
        logo_url: getLogoUrl(platform.url)
    }));

    // 1. Clear existing data (optional, but good for idempotent runs)
    const { error: deleteError } = await supabase
        .from('platforms')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.error('Error clearing platforms:', deleteError);
        // Continue anyway, maybe table is empty
    } else {
        console.log('Cleared existing platforms.');
    }

    // 2. Insert new data
    const { data, error } = await supabase
        .from('platforms')
        .insert(platformsWithLogos)
        .select();

    if (error) {
        console.error('❌ Error seeding platforms:', error);
    } else {
        console.log(`✅ Successfully inserted ${data.length} platforms with logos!`);
    }
}

seedPlatforms();
