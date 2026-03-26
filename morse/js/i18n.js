// Translation System
const TRANSLATIONS = {
    en: {
        // Navigation
        nav_home: 'Home',
        nav_learn: 'Learn',
        nav_encode: 'Encode',
        nav_decode: 'Decode',
        nav_flashcards: 'Flashcards',
        nav_quiz: 'Quiz',
        nav_practiceall: 'All',
        nav_ham: 'HAM',

        // Settings
        settings_speed: 'Speed',
        settings_tone: 'Tone',
        settings_volume: 'Volume',
        
        // Stats
        stat_accuracy: 'Accuracy',
        stat_streak: 'Streak',
        stat_best: 'Best',
        stat_learned: 'Learned',
        
        // Learn Mode
        learn_title: 'Reference Chart',
        learn_desc: 'Click any character to hear its sound. Track your progress as you learn.',
        
        // Encode Mode
        encode_title: 'Encode Practice',
        encode_desc: 'Convert the letter to Morse code using dots and dashes',
        encode_char: 'Character',
        encode_morse: 'Morse Code',
        encode_placeholder: 'Your answer...',
        btn_dot: 'Dot',
        btn_dash: 'Dash',
        btn_clear: 'Clear',
        btn_submit: 'Submit Answer',
        btn_skip: 'Skip',
        
        // Decode Mode
        decode_title: 'Decode Practice',
        decode_desc: 'Listen to the Morse code and type the letter you hear',
        decode_listening: 'Listen carefully...',
        decode_instruction: 'Press any letter key (A-Z) or number to answer',
        
        // Flashcards
        flashcards_title: 'Flashcards',
        flashcards_desc: 'Tap the card to reveal the Morse code',
        flashcards_hint: 'Tap to reveal',
        flashcards_label: 'Morse Code',
        btn_play: 'Play Sound',
        btn_next: 'Next Card',
        
        // Quiz
        quiz_title: 'Speed Quiz',
        quiz_desc: 'Test your knowledge with 10 random questions!',
        quiz_question: 'Question',
        quiz_of: 'of',
        quiz_instruction: 'Enter the Morse code for this character',
        quiz_placeholder: 'Enter Morse code...',
        
        // Buttons
        btn_dot: 'Dot',
        btn_dash: 'Dash',
        btn_clear: 'Clear',
        btn_submit: 'Submit Answer',
        btn_play: 'Play Sound',
        btn_next: 'Next Card',
        
        // Feedback
        feedback_correct: 'Correct!',
        feedback_wrong: 'Wrong!',
        
        // HAM Mode
        ham_title: 'HAM Radio Mode',
        ham_desc: 'Practice amateur radio Q-codes, prosigns, and callsigns',
        ham_beginner: "Beginner's Guide",
        ham_qcodes: 'Q-Codes',
        ham_prosigns: 'Prosigns',
        ham_callsigns: 'Callsigns',
        ham_abbr: 'Abbreviations',
        ham_qso: 'QSO Exchange',
        ham_cwpractice: 'CW Practice',
        
        // Beginner's Guide
        guide_title: "Beginner's Guide",
        guide_welcome_title: '📻 Welcome to HAM Radio',
        guide_welcome_desc: 'Amateur Radio (HAM) is a hobby where you can communicate with people worldwide using radio waves. It is fun, educational, and can be crucial during emergencies when other communication systems fail.',
        guide_first_contact_title: '🎯 Making Your First Contact',
        guide_step1: 'CQ CQ CQ - Call "CQ" three times to indicate you are calling anyone',
        guide_step2: 'DE [Your Callsign] - Say "DE" (this is) followed by your callsign',
        guide_step3: 'K - End with "K" to invite a response',
        guide_step4: 'Wait for someone to answer with your callsign',
        guide_step5: 'Exchange signal reports (RST), names, and locations',
        guide_step6: 'End with "73" (best regards) and your callsign',
        guide_example: 'Example: CQ CQ CQ DE W1ABC W1ABC K',
        guide_phonetic_title: '🔤 Phonetic Alphabet',
        guide_phonetic_desc: 'Used to clearly spell out callsigns and important words:',
        guide_rst_title: '📊 RST Signal Report',
        guide_rst_desc: 'Used to report signal quality (Readability, Strength, Tone):',
        guide_readability: 'R - Readability (1-5)',
        guide_readability_desc: '1 = Unreadable, 3 = Readable with difficulty, 5 = Perfectly readable',
        guide_strength: 'S - Signal Strength (1-9)',
        guide_strength_desc: '1 = Faint, 5 = Good, 9 = Extremely strong',
        guide_tone: 'T - Tone (1-9, CW only)',
        guide_tone_desc: '1 = Raw AC, 5 = Good tone, 9 = Perfect tone',
        guide_perfect_signal: 'A perfect signal is reported as',
        guide_abbreviations_title: '💬 Essential Abbreviations',
        guide_tips_title: '💡 Tips for Success',
        guide_tip1: 'Always listen before transmitting to avoid interrupting',
        guide_tip2: 'Speak clearly and at a moderate pace',
        guide_tip3: 'Use the phonetic alphabet for your callsign',
        guide_tip4: 'Keep QSOs brief when bands are busy',
        guide_tip5: 'Log your contacts for awards and contests',
        guide_tip6: 'Join a local amateur radio club to learn from experienced operators',
        guide_tip7: 'Practice CW regularly - even 10 minutes a day helps!',
        guide_ai_notice: 'AI Generated Content: This guide was created with AI assistance. Please verify critical information with official HAM radio resources and local regulations.',
        
        // CW Practice
        cw_listen_title: 'Listen & Type',
        cw_listen_desc: 'Listen to the CW message and type what you hear',
        cw_listen_play: 'Play Message',
        cw_listen_hint: 'Hint',
        
        cw_read_title: 'Read & Send',
        cw_read_desc: 'Send this message in Morse code',
        
        cw_twoway_title: 'Two-way QSO',
        cw_twoway_desc: 'Simulated conversation practice',
        cw_your_turn: 'Your turn to respond',
        cw_tap_reply: 'Tap Morse code to reply...',
        
        // Home
        home_title: 'Learn Hub',
        home_subtitle: 'Your collection of learning tools',
        home_desc: 'Master new skills with interactive practice',
        
        // Language
        lang_title: 'Language',
        lang_en: 'English',
        lang_zh: '中文',
    },
    
    zh: {
        // Navigation
        nav_home: '首页',
        nav_learn: '学习',
        nav_encode: '编码',
        nav_decode: '解码',
        nav_flashcards: '闪卡',
        nav_quiz: '测验',
        nav_practiceall: '全部',
        nav_ham: 'HAM',

        // Settings
        settings_speed: '速度',
        settings_tone: '音调',
        settings_volume: '音量',
        
        // Stats
        stat_accuracy: '准确率',
        stat_streak: '连胜',
        stat_best: '最佳',
        stat_learned: '已掌握',
        
        // Learn Mode
        learn_title: '参考图表',
        learn_desc: '点击任意字符听发音。跟踪您的学习进度。',
        
        // Encode Mode
        encode_title: '编码练习',
        encode_desc: '使用点和划将字母转换为摩斯电码',
        encode_char: '字符',
        encode_morse: '摩斯电码',
        encode_placeholder: '您的答案...',
        btn_dot: '点',
        btn_dash: '划',
        btn_clear: '清除',
        btn_submit: '提交答案',
        btn_skip: '跳过',
        
        // Decode Mode
        decode_title: '解码练习',
        decode_desc: '听摩斯电码并输入您听到的字母',
        decode_listening: '仔细听...',
        decode_instruction: '按任意字母键(A-Z)或数字键回答',
        
        // Flashcards
        flashcards_title: '闪卡',
        flashcards_desc: '点击卡片显示摩斯电码',
        flashcards_hint: '点击显示',
        flashcards_label: '摩斯电码',
        btn_play: '播放声音',
        btn_next: '下一张',
        
        // Quiz
        quiz_title: '速度测验',
        quiz_desc: '用10道随机问题测试您的知识！',
        quiz_question: '问题',
        quiz_of: '/',
        quiz_instruction: '输入此字符的摩斯电码',
        quiz_placeholder: '输入摩斯电码...',
        
        // Feedback
        feedback_correct: '正确！',
        feedback_wrong: '错误！',
        
        // HAM Mode
        ham_title: 'HAM无线电模式',
        ham_desc: '练习业余无线电Q码、缩语和呼号',
        ham_beginner: '新手指南',
        ham_qcodes: 'Q码',
        ham_prosigns: '程序信号',
        ham_callsigns: '呼号',
        ham_abbr: '缩写',
        ham_qso: 'QSO练习',
        ham_cwpractice: 'CW练习',
        
        // Beginner's Guide
        guide_title: '新手指南',
        guide_welcome_title: '📻 欢迎来到HAM无线电',
        guide_welcome_desc: '业余无线电（HAM）是一项爱好，您可以使用无线电波与世界各地的人通信。它有趣、有教育意义，并且在其他通信系统失效的紧急情况下可能至关重要。',
        guide_first_contact_title: '🎯 进行第一次通联',
        guide_step1: 'CQ CQ CQ - 呼叫三次"CQ"表示您正在呼叫任何人',
        guide_step2: 'DE [您的呼号] - 说"DE"（这是）后跟您的呼号',
        guide_step3: 'K - 以"K"结束以邀请回应',
        guide_step4: '等待有人用您的呼号回答',
        guide_step5: '交换信号报告（RST）、姓名和位置',
        guide_step6: '以"73"（致敬）和您的呼号结束',
        guide_example: '示例：CQ CQ CQ DE W1ABC W1ABC K',
        guide_phonetic_title: '🔤 语音字母表',
        guide_phonetic_desc: '用于清晰地拼写呼号和重要词汇：',
        guide_rst_title: '📊 RST信号报告',
        guide_rst_desc: '用于报告信号质量（可读性、强度、音调）：',
        guide_readability: 'R - 可读性（1-5）',
        guide_readability_desc: '1 = 无法阅读，3 = 难以阅读，5 = 完美可读',
        guide_strength: 'S - 信号强度（1-9）',
        guide_strength_desc: '1 = 微弱，5 = 良好，9 = 极强',
        guide_tone: 'T - 音调（1-9，仅CW）',
        guide_tone_desc: '1 = 原始交流电，5 = 良好音调，9 = 完美音调',
        guide_perfect_signal: '完美信号报告为',
        guide_abbreviations_title: '💬 常用缩语',
        guide_tips_title: '💡 成功秘诀',
        guide_tip1: '发射前先收听，避免打断他人',
        guide_tip2: '说话清晰，语速适中',
        guide_tip3: '使用语音字母表拼读您的呼号',
        guide_tip4: '频段繁忙时保持通联简短',
        guide_tip5: '记录您的通联以获取奖项和竞赛',
        guide_tip6: '加入当地业余无线电俱乐部向经验丰富的操作员学习',
        guide_tip7: '定期练习CW - 即使每天10分钟也有帮助！',
        guide_ai_notice: 'AI生成内容：本指南由AI辅助创建。请与官方HAM无线电资源和当地法规核实重要信息。',
        
        // CW Practice
        cw_listen_title: '听与输入',
        cw_listen_desc: '听CW消息并输入您听到的内容',
        cw_listen_play: '播放消息',
        cw_listen_hint: '提示',
        
        cw_read_title: '阅读与发送',
        cw_read_desc: '用摩斯电码发送此消息',
        
        cw_twoway_title: '双向QSO',
        cw_twoway_desc: '模拟对话练习',
        cw_your_turn: '轮到您回复',
        cw_tap_reply: '点击摩斯电码回复...',
        
        // Home
        home_title: '学习中心',
        home_subtitle: '您的学习工具集合',
        home_desc: '通过互动练习掌握新技能',
        
        // Language
        lang_title: '语言',
        lang_en: 'English',
        lang_zh: '中文',
    }
};

// Language Manager
class LanguageManager {
    constructor() {
        this.currentLang = this.loadLanguage();
    }
    
    loadLanguage() {
        const data = JSON.parse(localStorage.getItem('morseCodeApp') || '{}');
        return data.settings?.language || 'en';
    }
    
    saveLanguage(lang) {
        const data = JSON.parse(localStorage.getItem('morseCodeApp') || '{}');
        if (!data.settings) data.settings = {};
        data.settings.language = lang;
        localStorage.setItem('morseCodeApp', JSON.stringify(data));
        this.currentLang = lang;
    }
    
    get(key) {
        return TRANSLATIONS[this.currentLang]?.[key] || TRANSLATIONS['en'][key] || key;
    }
    
    getCurrentLang() {
        return this.currentLang;
    }
    
    setLanguage(lang) {
        this.saveLanguage(lang);
        this.updatePageText();
    }
    
    updatePageText() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.get(key);
            
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        });
        
        // Update document title if needed
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) {
            document.title = this.get(titleEl.getAttribute('data-i18n'));
        }
    }
}

// Create global instance
const i18n = new LanguageManager();
