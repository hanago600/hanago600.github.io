// Main Application Controller - Morse Code Learning App
// Features: Learn Chart, Encode/Decode Practice, Flashcards, Quiz, HAM Radio, CW Practice
class MorseApp {
    constructor() {
        // Core app state
        this.currentMode = 'learn';
        this.currentChar = null;
        this.userInput = '';
        this.score = 0;
        
        // Quiz & Flashcard state
        this.timer = null;
        this.flashcardFront = true;
        this.quizChars = [];
        this.quizIndex = 0;
        
        // HAM Radio practice state
        this.currentAbbreviation = null;
        this.currentCallsign = null;
        this.currentQCode = null;
        this.currentProsign = null;
        this.currentQSO = null;
        
        // CW Communication practice state
        this.cwReadSentence = null;
        this.cwReadInput = '';
        this.cwListenSentence = null;
        this.currentTwoWayQSO = null;
        this.twoWayTurnIndex = 0;
        this.twoWayInput = '';
        
        this.init();
    }

    // ==========================================
    // INITIALIZATION & SETUP
    // ==========================================
    
    init() {
        this.loadSettings();
        this.setupLanguage();
        this.setupEventListeners();
        this.renderChart();
        this.updateStats();
        this.switchMode('learn');
        
        // Pause sound wave animations initially to save battery
        document.querySelectorAll('.sound-wave, .sound-wave-large').forEach(wave => {
            wave.classList.add('paused');
        });
    }

    setupLanguage() {
        // Set initial language from localStorage
        const savedLang = i18n.getCurrentLang();
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.value = savedLang;
            
            // Add change listener
            langSelect.addEventListener('change', (e) => {
                i18n.setLanguage(e.target.value);
            });
        }
        
        // Apply translations
        i18n.updatePageText();
    }

    loadSettings() {
        const settings = morseStorage.getSettings();
        morseAudio.setWPM(settings.wpm);
        morseAudio.setFrequency(settings.frequency);
        morseAudio.setVolume(settings.volume);
        this.applyTheme(settings.theme);
        
        // Update slider values
        document.getElementById('wpm-slider').value = settings.wpm;
        document.getElementById('wpm-value').textContent = settings.wpm + ' WPM';
        document.getElementById('freq-slider').value = settings.frequency;
        document.getElementById('freq-value').textContent = settings.frequency + ' Hz';
        document.getElementById('volume-slider').value = settings.volume * 100;
        document.getElementById('volume-value').textContent = Math.round(settings.volume * 100) + '%';
    }

    applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Audio init on first interaction - this is critical for browsers
        const unlockAudio = async () => {
            await morseAudio.init();
            console.log('Audio context unlocked');
        };
        
        // Try to unlock on various user interactions
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
        
        // Pause sound wave animations when not playing (battery optimization)
        window.addEventListener('morsePlayState', (e) => {
            const soundWaves = document.querySelectorAll('.sound-wave, .sound-wave-large');
            soundWaves.forEach(wave => {
                if (e.detail.playing) {
                    wave.classList.remove('paused');
                } else {
                    wave.classList.add('paused');
                }
            });
        });

        // Settings
        document.getElementById('wpm-slider').addEventListener('input', (e) => {
            const wpm = parseInt(e.target.value);
            morseAudio.setWPM(wpm);
            document.getElementById('wpm-value').textContent = wpm + ' WPM';
            morseStorage.updateSettings({ wpm });
        });

        document.getElementById('freq-slider').addEventListener('input', (e) => {
            const freq = parseInt(e.target.value);
            morseAudio.setFrequency(freq);
            document.getElementById('freq-value').textContent = freq + ' Hz';
            morseStorage.updateSettings({ frequency: freq });
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value) / 100;
            morseAudio.setVolume(vol);
            document.getElementById('volume-value').textContent = e.target.value + '%';
            morseStorage.updateSettings({ volume: vol });
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            const currentTheme = morseStorage.getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            morseStorage.setTheme(newTheme);
        });

        // Input handlers for practice modes
        this.setupInputHandlers();
        this.setupAutoCheckInputs();
    }

    setupAutoCheckInputs() {
        // Detect touch device
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

        // Auto-check CW Listen input as user types
        const cwListenInput = document.getElementById('cw-listen-input');
        if (cwListenInput) {
            // Prevent virtual keyboard on touch devices
            if (isTouchDevice) {
                cwListenInput.setAttribute('readonly', 'readonly');
            }

            cwListenInput.addEventListener('input', (e) => {
                if (this.cwListenSentence && e.target.value.trim().toUpperCase() === this.cwListenSentence.message.toUpperCase()) {
                    this.checkCWListen();
                }
            });

            // Handle physical keyboard input for CW Listen
            cwListenInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.checkCWListen();
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    // Allow backspace/delete
                } else if (e.key === ' ') {
                    // Allow space
                } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                    // Allow alphanumeric characters
                } else {
                    // Prevent other keys
                    e.preventDefault();
                }
            });
        }

        // Handle physical keyboard input for callsign practice
        const callsignInput = document.getElementById('callsign-input');
        if (callsignInput) {
            // Prevent virtual keyboard on touch devices
            if (isTouchDevice) {
                callsignInput.setAttribute('readonly', 'readonly');
            }

            callsignInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.checkCallsign();
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    // Allow backspace/delete
                } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                    // Allow alphanumeric characters
                } else {
                    // Prevent other keys
                    e.preventDefault();
                }
            });
        }

        // Handle physical keyboard input for Q-Code practice
        const qcodeInput = document.getElementById('qcode-input');
        if (qcodeInput) {
            // Prevent virtual keyboard on touch devices
            if (isTouchDevice) {
                qcodeInput.setAttribute('readonly', 'readonly');
            }

            qcodeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.checkQCode();
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    // Allow backspace/delete
                } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                    // Allow alphanumeric characters
                } else {
                    // Prevent other keys
                    e.preventDefault();
                }
            });
        }

        // Handle physical keyboard input for Prosign practice
        const prosignInput = document.getElementById('prosign-input');
        if (prosignInput) {
            // Prevent virtual keyboard on touch devices
            if (isTouchDevice) {
                prosignInput.setAttribute('readonly', 'readonly');
            }

            prosignInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.checkProsign();
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    // Allow backspace/delete
                } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                    // Allow alphanumeric characters
                } else {
                    // Prevent other keys
                    e.preventDefault();
                }
            });
        }

        // Handle physical keyboard input for Abbreviation practice
        const abbrInput = document.getElementById('abbr-input');
        if (abbrInput) {
            // Prevent virtual keyboard on touch devices
            if (isTouchDevice) {
                abbrInput.setAttribute('readonly', 'readonly');
            }

            abbrInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.checkAbbreviation();
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    // Allow backspace/delete
                } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                    // Allow alphanumeric characters
                } else {
                    // Prevent other keys
                    e.preventDefault();
                }
            });
        }
    }

    setupInputHandlers() {
        // Dot and Dash buttons
        document.getElementById('btn-dot')?.addEventListener('click', () => this.handleSymbolInput('.'));
        document.getElementById('btn-dash')?.addEventListener('click', () => this.handleSymbolInput('-'));
        document.getElementById('btn-clear')?.addEventListener('click', () => this.clearInput());
        document.getElementById('btn-submit')?.addEventListener('click', () => this.submitInput());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (this.currentMode === 'encode') {
                if (e.key === '.' || e.key === 'e' || e.key === 'E') {
                    this.handleSymbolInput('.');
                } else if (e.key === '-' || e.key === 't' || e.key === 'T') {
                    this.handleSymbolInput('-');
                } else if (e.key === 'Enter') {
                    this.submitInput();
                } else if (e.key === 'Backspace' || e.key === 'Escape') {
                    this.clearInput();
                }
            } else if (this.currentMode === 'decode') {
                if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                    this.checkDecodeAnswer(e.key.toUpperCase());
                }
            } else if (this.currentMode === 'quiz') {
                if (e.key === '.' || e.key === 'e' || e.key === 'E') {
                    this.handleQuizInput('.');
                } else if (e.key === '-' || e.key === 't' || e.key === 'T') {
                    this.handleQuizInput('-');
                } else if (e.key === 'Enter') {
                    this.submitQuizAnswer();
                } else if (e.key === 'Backspace' || e.key === 'Escape') {
                    this.clearQuizInput();
                }
            } else if (this.currentMode === 'ham') {
                // Handle callsign input Enter key
                if (e.key === 'Enter' && document.activeElement?.id === 'callsign-input') {
                    this.checkCallsign();
                }
                
                // Handle Q-Code input Enter key
                if (e.key === 'Enter' && document.activeElement?.id === 'qcode-input') {
                    this.checkQCode();
                }
                
                // Handle Prosign input Enter key
                if (e.key === 'Enter' && document.activeElement?.id === 'prosign-input') {
                    this.checkProsign();
                }

                // Handle Abbreviation input Enter key
                if (e.key === 'Enter' && document.activeElement?.id === 'abbr-input') {
                    this.checkAbbreviation();
                }

                // Handle CW Read mode physical keyboard
                if (this.currentCWMode === 'read') {
                    if (e.key === '.' || e.key === 'e' || e.key === 'E') {
                        this.handleCWReadInput('.');
                    } else if (e.key === '-' || e.key === 't' || e.key === 'T') {
                        this.handleCWReadInput('-');
                    } else if (e.key === 'Enter') {
                        this.checkCWRead();
                    } else if (e.key === 'Backspace' || e.key === 'Escape') {
                        this.clearCWReadInput();
                    }
                }
                
                // Handle Two-way mode physical keyboard
                if (this.currentCWMode === 'twoway') {
                    if (e.key === '.' || e.key === 'e' || e.key === 'E') {
                        this.handleTwoWayInput('.');
                    } else if (e.key === '-' || e.key === 't' || e.key === 'T') {
                        this.handleTwoWayInput('-');
                    } else if (e.key === 'Enter') {
                        this.submitTwoWayResponse();
                    } else if (e.key === 'Backspace' || e.key === 'Escape') {
                        this.clearTwoWayInput();
                    }
                }
            }
        });

        // Flashcard controls
        document.getElementById('flashcard')?.addEventListener('click', () => this.flipFlashcard());
        document.getElementById('btn-next-card')?.addEventListener('click', () => this.nextFlashcard());
        document.getElementById('btn-play-card')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playCurrentFlashcard();
        });
    }

    // ==========================================
    // MODE SWITCHING & NAVIGATION
    // ==========================================
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide sections
        document.querySelectorAll('.mode-section').forEach(section => {
            section.classList.toggle('active', section.id === `mode-${mode}`);
        });

        // Initialize mode
        if (mode === 'encode') this.initEncodeMode();
        else if (mode === 'decode') this.initDecodeMode();
        else if (mode === 'flashcards') this.initFlashcards();
        else if (mode === 'quiz') this.initQuiz();
        else if (mode === 'practiceall') this.initPracticeAll();
        else if (mode === 'ham') this.initHAMMode();
    }

    // ==========================================
    // LEARN MODE - Reference Chart
    // ==========================================
    
    renderChart() {
        const chartContainer = document.getElementById('morse-chart');
        if (!chartContainer) return;

        let html = '<div class="chart-grid">';
        
        // Letters A-M
        html += '<div class="chart-column"><h3>A - M</h3>';
        LETTERS.slice(0, 13).forEach(char => {
            html += this.createChartItem(char);
        });
        html += '</div>';
        
        // Letters N-Z
        html += '<div class="chart-column"><h3>N - Z</h3>';
        LETTERS.slice(13).forEach(char => {
            html += this.createChartItem(char);
        });
        html += '</div>';
        
        // Numbers
        html += '<div class="chart-column"><h3>0 - 9</h3>';
        NUMBERS.forEach(char => {
            html += this.createChartItem(char);
        });
        html += '</div>';
        
        html += '</div>';
        chartContainer.innerHTML = html;

        // Add click handlers
        chartContainer.querySelectorAll('.chart-item').forEach(item => {
            item.addEventListener('click', async () => {
                await morseAudio.init();
                const char = item.dataset.char;
                await this.playChar(char);
            });
        });
    }

    createChartItem(char) {
        const accuracy = morseStorage.getLetterAccuracy(char);
        const learned = morseStorage.getLearnedLetters().includes(char);
        let statusClass = '';
        if (learned) statusClass = 'learned';
        else if (accuracy > 0) statusClass = 'in-progress';
        
        return `
            <div class="chart-item ${statusClass}" data-char="${char}">
                <span class="char">${char}</span>
                <span class="morse">${MORSE_CODE[char]}</span>
            </div>
        `;
    }

    async playChar(char) {
        await morseAudio.playChar(char);
    }

    async playMorse(morse) {
        await morseAudio.playMorse(morse);
    }

    // ==========================================
    // PRACTICE MODE - Encode (Letter → Morse)
    // ==========================================
    
    initEncodeMode() {
        this.userInput = '';
        this.updateInputDisplay();
        this.hideFeedback('encode-feedback');
        this.nextQuestion();
    }

    nextQuestion() {
        this.currentChar = morseStorage.getWeightedRandomChar(ALL_CHARS);
        this.userInput = '';
        this.updateInputDisplay();
        
        const charEl = document.getElementById('encode-char');
        const morseEl = document.getElementById('encode-morse');
        
        if (charEl) charEl.textContent = this.currentChar;
        if (morseEl) {
            morseEl.textContent = MORSE_CODE[this.currentChar];
            morseEl.classList.add('hidden');
        }
        
        this.hideFeedback('encode-feedback');
    }

    handleSymbolInput(symbol) {
        if (this.userInput.length < 6) {
            this.userInput += symbol;
            this.updateInputDisplay();
            
            // Auto-submit if answer is correct
            if (this.currentMode === 'encode' && this.userInput === MORSE_CODE[this.currentChar]) {
                setTimeout(() => this.submitInput(), 300);
            }
        }
    }

    clearInput() {
        this.userInput = '';
        this.updateInputDisplay();
    }

    updateInputDisplay() {
        const display = document.getElementById('user-input');
        if (display) {
            if (this.userInput) {
                display.textContent = this.userInput;
                display.classList.add('has-input');
            } else {
                display.innerHTML = '<span class="placeholder">Your answer...</span>';
                display.classList.remove('has-input');
            }
        }
    }

    submitInput() {
        if (!this.currentChar || !this.userInput) return;
        
        const correct = this.userInput === MORSE_CODE[this.currentChar];
        
        morseStorage.recordAttempt(correct);
        morseStorage.recordLetterPractice(this.currentChar, correct);
        
        const morseEl = document.getElementById('encode-morse');
        if (morseEl) morseEl.classList.remove('hidden');
        
        if (correct) {
            this.showFeedback('encode-feedback', '✓ Correct! Great job!', 'correct');
            setTimeout(() => this.nextQuestion(), 1500);
        } else {
            this.showFeedback('encode-feedback', `✗ It's ${MORSE_CODE[this.currentChar]}`, 'wrong');
        }
        
        this.updateStats();
        this.renderChart();
    }

    // ==========================================
    // PRACTICE MODE - Decode (Morse → Letter)
    // ==========================================
    
    initDecodeMode() {
        this.nextDecodeQuestion();
    }

    nextDecodeQuestion() {
        this.currentChar = morseStorage.getWeightedRandomChar(ALL_CHARS);
        this.hideFeedback('decode-feedback');
        
        const answerEl = document.getElementById('decode-answer');
        if (answerEl) {
            answerEl.textContent = '?';
            answerEl.className = 'decode-answer';
        }
        
        // Auto-play the Morse code
        setTimeout(() => {
            morseAudio.playChar(this.currentChar);
        }, 500);
    }

    async playCurrentDecode() {
        // Replay the current character without changing it
        if (this.currentChar) {
            await morseAudio.init(); // Ensure audio context is initialized
            await morseAudio.playChar(this.currentChar);
        }
    }

    async checkDecodeAnswer(answer) {
        const correct = answer === this.currentChar;
        const answerEl = document.getElementById('decode-answer');
        
        morseStorage.recordAttempt(correct);
        morseStorage.recordLetterPractice(this.currentChar, correct);
        
        if (answerEl) {
            answerEl.textContent = this.currentChar;
            answerEl.className = 'decode-answer ' + (correct ? 'correct' : 'wrong');
        }
        
        if (correct) {
            this.showFeedback('decode-feedback', '✓ Correct!', 'correct');
            setTimeout(() => this.nextDecodeQuestion(), 1500);
        } else {
            this.showFeedback('decode-feedback', `You pressed: ${answer}`, 'wrong');
            setTimeout(() => this.nextDecodeQuestion(), 2000);
        }
        
        this.updateStats();
        this.renderChart();
    }

    handleDecodeKey(key) {
        this.checkDecodeAnswer(key);
    }

    // ==========================================
    // PRACTICE MODE - Flashcards
    // ==========================================
    
    initFlashcards() {
        this.flashcardFront = true;
        this.nextFlashcard();
    }

    nextFlashcard() {
        this.currentChar = morseStorage.getWeightedRandomChar(ALL_CHARS);
        this.flashcardFront = true;
        this.renderFlashcard();
    }

    renderFlashcard() {
        const card = document.getElementById('flashcard');
        if (!card) return;
        
        const frontChar = card.querySelector('.card-char');
        const backMorse = card.querySelector('.card-morse');
        
        if (frontChar) frontChar.textContent = this.currentChar;
        if (backMorse) backMorse.textContent = MORSE_CODE[this.currentChar];
        
        if (this.flashcardFront) {
            card.classList.remove('flipped');
        } else {
            card.classList.add('flipped');
        }
    }

    flipFlashcard() {
        this.flashcardFront = !this.flashcardFront;
        const card = document.getElementById('flashcard');
        if (card) {
            card.classList.toggle('flipped', !this.flashcardFront);
        }
    }

    async playCurrentFlashcard() {
        await morseAudio.playChar(this.currentChar);
    }

    // ==========================================
    // PRACTICE MODE - Quiz
    // ==========================================
    
    initQuiz() {
        this.quizChars = morseStorage.getWeightedRandomChars(ALL_CHARS, 10);
        this.quizIndex = 0;
        this.score = 0;
        
        // Reset quiz HTML if it was replaced by results
        const quizSection = document.getElementById('mode-quiz');
        if (quizSection && !quizSection.querySelector('.quiz-card')) {
            location.reload(); // Simple reset - in production you'd rebuild the DOM
            return;
        }
        
        this.showQuizQuestion();
    }

    showQuizQuestion() {
        if (this.quizIndex >= this.quizChars.length) {
            this.showQuizResults();
            return;
        }
        
        this.currentChar = this.quizChars[this.quizIndex];
        this.quizInput = '';
        
        const progressEl = document.getElementById('quiz-progress');
        const charEl = document.getElementById('quiz-char');
        const inputEl = document.getElementById('quiz-input');
        const progressFill = document.getElementById('quiz-progress-fill');
        
        if (progressEl) progressEl.textContent = `Question ${this.quizIndex + 1} of ${this.quizChars.length}`;
        if (charEl) charEl.textContent = this.currentChar;
        if (inputEl) inputEl.value = '';
        if (progressFill) {
            progressFill.style.width = ((this.quizIndex / this.quizChars.length) * 100) + '%';
        }
        
        this.updateQuizInputDisplay();
        this.hideFeedback('quiz-feedback');
    }

    handleQuizInput(symbol) {
        if (this.quizInput.length < 6) {
            this.quizInput += symbol;
            this.updateQuizInputDisplay();
            
            // Auto-submit if answer is correct
            if (this.quizInput === MORSE_CODE[this.currentChar]) {
                setTimeout(() => this.submitQuizAnswer(), 300);
            }
        }
    }

    clearQuizInput() {
        this.quizInput = '';
        this.updateQuizInputDisplay();
    }

    updateQuizInputDisplay() {
        const preview = document.getElementById('quiz-input-preview');
        const hiddenInput = document.getElementById('quiz-input');
        
        if (preview) {
            if (this.quizInput) {
                preview.textContent = this.quizInput;
                preview.classList.add('has-input');
            } else {
                preview.innerHTML = '<span class="placeholder">Enter Morse code...</span>';
                preview.classList.remove('has-input');
            }
        }
        
        if (hiddenInput) {
            hiddenInput.value = this.quizInput;
        }
    }

    submitQuizAnswer() {
        const answer = this.quizInput.trim();
        
        if (!answer) return;
        
        const correct = answer === MORSE_CODE[this.currentChar];
        
        if (correct) {
            this.score++;
            this.showFeedback('quiz-feedback', '✓ Correct!', 'correct');
        } else {
            this.showFeedback('quiz-feedback', `✗ It's ${MORSE_CODE[this.currentChar]}`, 'wrong');
        }
        
        this.quizIndex++;
        setTimeout(() => this.showQuizQuestion(), 1000);
    }

    showQuizResults() {
        const percentage = Math.round((this.score / this.quizChars.length) * 100);
        const quizSection = document.getElementById('mode-quiz');
        
        let message = '';
        let emoji = '';
        if (percentage >= 90) {
            message = 'Outstanding!';
            emoji = '🏆';
        } else if (percentage >= 70) {
            message = 'Great job!';
            emoji = '⭐';
        } else if (percentage >= 50) {
            message = 'Good effort!';
            emoji = '👍';
        } else {
            message = 'Keep practicing!';
            emoji = '💪';
        }
        
        quizSection.innerHTML = `
            <div class="quiz-wrapper">
                <div class="quiz-card glass-card" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">${emoji}</div>
                    <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, var(--text-primary), var(--primary-300)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${message}</h2>
                    <div style="font-size: 3.5rem; font-weight: 800; color: var(--primary-400); margin: 1.5rem 0;">${this.score}/${this.quizChars.length}</div>
                    <div style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem;">${percentage}% accuracy</div>
                    <button class="control-btn primary" onclick="app.restartQuiz()" style="display: inline-flex;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        `;
    }

    restartQuiz() {
        // Restore the quiz HTML structure
        const quizSection = document.getElementById('mode-quiz');
        quizSection.innerHTML = `
            <div class="quiz-wrapper">
                <div class="quiz-card glass-card">
                    <div class="quiz-progress-bar">
                        <div class="progress-fill" id="quiz-progress-fill"></div>
                    </div>
                    
                    <div class="quiz-header">
                        <span class="quiz-step" id="quiz-progress">Question 1 of 10</span>
                    </div>
                    
                    <div class="quiz-question">
                        <div class="quiz-char-display" id="quiz-char">A</div>
                        <p class="quiz-instruction" data-i18n="quiz_instruction">Enter the Morse code for this character</p>
                    </div>
                    
                    <div class="quiz-input-section">
                        <div class="input-preview" id="quiz-input-preview">
                            <span class="placeholder" data-i18n="quiz_placeholder">Enter Morse code...</span>
                        </div>
                        
                        <div class="input-pad" style="margin-bottom: 1rem;">
                            <button class="pad-btn dot" onclick="app.handleQuizInput('.')">
                                <span class="btn-content">
                                    <span class="btn-icon">•</span>
                                    <span class="btn-label" data-i18n="btn_dot">Dot</span>
                                </span>
                            </button>
                            <button class="pad-btn dash" onclick="app.handleQuizInput('-')">
                                <span class="btn-content">
                                    <span class="btn-icon">−</span>
                                    <span class="btn-label" data-i18n="btn_dash">Dash</span>
                                </span>
                            </button>
                            <button class="pad-btn clear" onclick="app.clearQuizInput()">
                                <span class="btn-content">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    <span class="btn-label" data-i18n="btn_clear">Clear</span>
                                </span>
                            </button>
                        </div>
                        
                        <input type="hidden" id="quiz-input" value="">
                        
                        <button class="submit-btn" onclick="app.submitQuizAnswer()" style="margin: 0 auto; display: flex; padding: 0 2rem;">
                            <span data-i18n="btn_submit">Submit Answer</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="feedback-message" id="quiz-feedback"></div>
                </div>
            </div>
        `;
        // Reinitialize quiz
        this.initQuiz();
    }

    // Practice All Mode - Practice all characters in random order
    initPracticeAll() {
        // Create array of all characters and shuffle
        this.practiceAllChars = [...ALL_CHARS].sort(() => Math.random() - 0.5);
        this.practiceAllIndex = 0;
        this.practiceAllScore = 0;
        this.practiceAllInput = '';
        this.showPracticeAllQuestion();
    }

    showPracticeAllQuestion() {
        if (this.practiceAllIndex >= this.practiceAllChars.length) {
            this.showPracticeAllResults();
            return;
        }

        this.currentChar = this.practiceAllChars[this.practiceAllIndex];
        this.practiceAllInput = '';
        
        const charEl = document.getElementById('practiceall-char');
        const progressEl = document.getElementById('practiceall-progress');
        const progressFill = document.getElementById('practiceall-progress-fill');
        
        if (charEl) charEl.textContent = this.currentChar;
        if (progressEl) {
            progressEl.textContent = `Character ${this.practiceAllIndex + 1} of ${this.practiceAllChars.length}`;
        }
        if (progressFill) {
            const percentage = (this.practiceAllIndex / this.practiceAllChars.length) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        this.updatePracticeAllInputDisplay();
        this.hideFeedback('practiceall-feedback');
    }

    handlePracticeAllInput(symbol) {
        if (this.practiceAllInput.length < 6) {
            this.practiceAllInput += symbol;
            this.updatePracticeAllInputDisplay();
            
            // Auto-submit if answer is correct
            if (this.practiceAllInput === MORSE_CODE[this.currentChar]) {
                setTimeout(() => this.submitPracticeAllAnswer(), 300);
            }
        }
    }

    clearPracticeAllInput() {
        this.practiceAllInput = '';
        this.updatePracticeAllInputDisplay();
    }

    updatePracticeAllInputDisplay() {
        const preview = document.getElementById('practiceall-input-preview');
        const hiddenInput = document.getElementById('practiceall-input');
        
        if (preview) {
            if (this.practiceAllInput) {
                preview.textContent = this.practiceAllInput;
                preview.classList.add('has-input');
            } else {
                preview.innerHTML = '<span class="placeholder">Enter Morse code...</span>';
                preview.classList.remove('has-input');
            }
        }
        
        if (hiddenInput) {
            hiddenInput.value = this.practiceAllInput;
        }
    }

    submitPracticeAllAnswer() {
        const answer = this.practiceAllInput.trim();
        
        if (!answer) return;
        
        const correct = answer === MORSE_CODE[this.currentChar];
        
        if (correct) {
            this.practiceAllScore++;
            this.showFeedback('practiceall-feedback', '✓ Correct!', 'correct');
        } else {
            this.showFeedback('practiceall-feedback', `✗ It's ${MORSE_CODE[this.currentChar]}`, 'wrong');
        }
        
        this.practiceAllIndex++;
        setTimeout(() => this.showPracticeAllQuestion(), 1000);
    }

    showPracticeAllResults() {
        const percentage = Math.round((this.practiceAllScore / this.practiceAllChars.length) * 100);
        const section = document.getElementById('mode-practiceall');
        
        let message = '';
        let emoji = '';
        if (percentage >= 90) {
            message = 'Outstanding! You mastered all characters!';
            emoji = '🏆';
        } else if (percentage >= 70) {
            message = 'Great job! Almost there!';
            emoji = '⭐';
        } else if (percentage >= 50) {
            message = 'Good effort! Keep practicing!';
            emoji = '👍';
        } else {
            message = 'Keep practicing! You\'ll get there!';
            emoji = '💪';
        }
        
        section.innerHTML = `
            <div class="quiz-wrapper">
                <div class="quiz-card glass-card" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">${emoji}</div>
                    <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, var(--text-primary), var(--primary-300)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${message}</h2>
                    <div style="font-size: 3.5rem; font-weight: 800; color: var(--primary-400); margin: 1.5rem 0;">${this.practiceAllScore}/${this.practiceAllChars.length}</div>
                    <div style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem;">${percentage}% accuracy</div>
                    <button class="control-btn primary" onclick="app.restartPracticeAll()" style="display: inline-flex;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        `;
    }

    restartPracticeAll() {
        // Restore the Practice All HTML structure
        const section = document.getElementById('mode-practiceall');
        section.innerHTML = `
            <div class="quiz-wrapper">
                <div class="quiz-card glass-card">
                    <div class="quiz-progress-bar">
                        <div class="progress-fill" id="practiceall-progress-fill"></div>
                    </div>
                    
                    <div class="quiz-header">
                        <span class="quiz-step" id="practiceall-progress">Character 1 of 36</span>
                    </div>
                    
                    <div class="quiz-question">
                        <div class="quiz-char-display" id="practiceall-char">A</div>
                        <p class="quiz-instruction">Enter the Morse code for this character</p>
                    </div>
                    
                    <div class="quiz-input-section">
                        <div class="input-preview" id="practiceall-input-preview">
                            <span class="placeholder">Enter Morse code...</span>
                        </div>
                        
                        <div class="input-pad" style="margin-bottom: 1rem;">
                            <button class="pad-btn dot" onclick="app.handlePracticeAllInput('.')">
                                <span class="btn-content">
                                    <span class="btn-icon">•</span>
                                    <span class="btn-label" data-i18n="btn_dot">Dot</span>
                                </span>
                            </button>
                            <button class="pad-btn dash" onclick="app.handlePracticeAllInput('-')">
                                <span class="btn-content">
                                    <span class="btn-icon">−</span>
                                    <span class="btn-label" data-i18n="btn_dash">Dash</span>
                                </span>
                            </button>
                            <button class="pad-btn clear" onclick="app.clearPracticeAllInput()">
                                <span class="btn-content">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    <span class="btn-label" data-i18n="btn_clear">Clear</span>
                                </span>
                            </button>
                        </div>
                        
                        <input type="hidden" id="practiceall-input" value="">
                        
                        <button class="submit-btn" onclick="app.submitPracticeAllAnswer()" style="margin: 0 auto; display: flex; padding: 0 2rem;">
                            <span data-i18n="btn_submit">Submit Answer</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="feedback-message" id="practiceall-feedback"></div>
                </div>
            </div>
        `;
        // Reinitialize Practice All
        this.initPracticeAll();
    }

    // Feedback helpers
    showFeedback(elementId, message, type) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.className = 'feedback-message show ' + type;
        }
    }

    hideFeedback(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.className = 'feedback-message';
            el.textContent = '';
        }
    }

    updateStats() {
        const stats = morseStorage.getStats();
        const accuracyEl = document.getElementById('stat-accuracy');
        const streakEl = document.getElementById('stat-streak');
        const bestEl = document.getElementById('stat-best');
        const learnedEl = document.getElementById('stat-learned');
        
        if (accuracyEl) accuracyEl.textContent = this.getAccuracy() + '%';
        if (streakEl) streakEl.textContent = stats.streak;
        if (bestEl) bestEl.textContent = stats.bestStreak;
        if (learnedEl) learnedEl.textContent = morseStorage.getLearnedLetters().length;
    }

    getAccuracy() {
        const stats = morseStorage.getStats();
        if (stats.totalAttempts === 0) return 0;
        return Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
    }

    // ==========================================
    // HAM RADIO MODE - Q-Codes, Prosigns, Callsigns, Abbreviations
    // ==========================================
    
    initHAMMode() {
        // Delay rendering slightly to ensure DOM is ready
        setTimeout(() => {
            this.renderQCodes();
            this.renderProsigns();
            this.renderAbbreviations();
        }, 100);
        this.setupHAMNav();
    }

    setupHAMNav() {
        // HAM sub-navigation
        document.querySelectorAll('.ham-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.hamMode;
                this.switchHAMMode(mode);
            });
        });

        // CW Practice tabs
        document.querySelectorAll('.cw-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.cwMode;
                this.switchCWMode(mode);
            });
        });
    }

    switchHAMMode(mode) {
        document.querySelectorAll('.ham-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.hamMode === mode);
        });

        document.querySelectorAll('.ham-subsection').forEach(section => {
            section.classList.toggle('active', section.id === `ham-${mode}`);
        });

        // Initialize specific modes
        if (mode === 'callsigns') this.nextCallsign();
        if (mode === 'qso') this.nextQSO();
        if (mode === 'qcodes') {
            this.renderQCodes();
            this.nextQCode();
        }
        if (mode === 'prosigns') {
            this.renderProsigns();
            this.nextProsign();
        }
        if (mode === 'abbr') {
            this.renderAbbreviations();
            this.nextAbbreviation();
        }
        if (mode === 'cwpractice') {
            this.switchCWMode('listen');
            this.nextCWListen();
        }
        if (mode === 'prosigns') {
            // Delay to ensure DOM is visible
            setTimeout(() => this.renderProsigns(), 50);
            this.nextProsign();
        }
        if (mode === 'abbr') {
            // Delay to ensure DOM is visible
            setTimeout(() => this.renderAbbreviations(), 50);
            this.nextAbbreviation();
        }
        if (mode === 'cwpractice') {
            this.switchCWMode('listen');
            this.nextCWListen();
        }
    }

    switchCWMode(mode) {
        this.currentCWMode = mode;
        document.querySelectorAll('.cw-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cwMode === mode);
        });

        document.querySelectorAll('.cw-subsection').forEach(section => {
            section.classList.toggle('active', section.id === `cw-${mode}`);
        });

        // Initialize mode
        if (mode === 'listen') this.nextCWListen();
        if (mode === 'read') this.nextCWRead();
        if (mode === 'twoway') this.startNewTwoWay();
    }

    // Render HAM reference lists
    renderQCodes() {
        const renderToContainer = (containerId) => {
            const container = document.getElementById(containerId);
            if (!container) {
                console.warn(`Container ${containerId} not found`);
                return false;
            }
            
            let html = '<div class="chart-grid">';
            Object.entries(Q_CODES).forEach(([code, info]) => {
                html += `
                    <div class="chart-item" data-qcode="${code}">
                        <span class="char">${code}</span>
                        <span class="morse">${info.meaning}</span>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            // Add click handlers after rendering
            container.querySelectorAll('.chart-item').forEach(item => {
                item.addEventListener('click', async () => {
                    await morseAudio.init();
                    const code = item.dataset.qcode;
                    await morseAudio.playText(code);
                });
            });
            console.log(`Rendered Q-Codes to ${containerId}`);
            return true;
        };
        
        // Render to both containers if they exist
        renderToContainer('qcodes-list');
        renderToContainer('qcodes-list-practice');
    }

    renderProsigns() {
        const renderToContainer = (containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return false;
            
            let html = '<div class="chart-grid">';
            Object.entries(PROSIGNS).forEach(([sig, info]) => {
                html += `
                    <div class="chart-item" data-prosign="${sig}" data-code="${info.code}">
                        <span class="char">${sig}</span>
                        <span class="morse">${info.meaning}</span>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            // Add click handlers after rendering
            container.querySelectorAll('.chart-item').forEach(item => {
                item.addEventListener('click', async () => {
                    await morseAudio.init();
                    const code = item.dataset.code;
                    const sig = item.dataset.prosign;
                    await morseAudio.playProsign(code, sig);
                });
            });
            return true;
        };
        
        // Render to both containers if they exist
        renderToContainer('prosigns-list');
        renderToContainer('prosigns-list-practice');
    }

    renderAbbreviations() {
        const renderToContainer = (containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return false;
            
            let html = '<div class="chart-grid">';
            Object.entries(ABBREVIATIONS).forEach(([abbr, info]) => {
                html += `
                    <div class="chart-item" data-abbr="${abbr}">
                        <span class="char">${abbr}</span>
                        <span class="morse">${info.meaning}</span>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            // Add click handlers after rendering
            container.querySelectorAll('.chart-item').forEach(item => {
                item.addEventListener('click', async () => {
                    await morseAudio.init();
                    const abbr = item.dataset.abbr;
                    await morseAudio.playText(abbr);
                });
            });
            return true;
        };
        
        // Render to both containers if they exist
        renderToContainer('abbreviations-list');
        renderToContainer('abbreviations-list-practice');
    }

    // Abbreviation Practice
    nextAbbreviation() {
        const abbrs = Object.keys(ABBREVIATIONS);
        this.currentAbbreviation = abbrs[Math.floor(Math.random() * abbrs.length)];
        
        // Hide the abbreviation with blur effect
        const display = document.getElementById('abbr-display');
        const meaningDisplay = document.getElementById('abbr-meaning');
        if (display) {
            display.textContent = '????';
            display.style.filter = 'blur(8px)';
            display.style.opacity = '0.3';
        }
        if (meaningDisplay) {
            meaningDisplay.style.display = 'none';
            meaningDisplay.textContent = '';
        }
        
        const input = document.getElementById('abbr-input');
        if (input) {
            input.value = '';
        }
        
        this.hideFeedback('abbr-feedback');
        
        // Auto-play the abbreviation after a short delay
        setTimeout(async () => {
            if (this.currentAbbreviation) {
                await morseAudio.playText(this.currentAbbreviation);
            }
        }, 500);
    }

    revealAbbreviation() {
        const display = document.getElementById('abbr-display');
        const meaningDisplay = document.getElementById('abbr-meaning');
        if (display && this.currentAbbreviation) {
            display.textContent = this.currentAbbreviation;
            display.style.filter = 'none';
            display.style.opacity = '1';
        }
        if (meaningDisplay && this.currentAbbreviation) {
            const abbrInfo = ABBREVIATIONS[this.currentAbbreviation];
            meaningDisplay.style.display = 'block';
            meaningDisplay.innerHTML = `<strong>${this.currentAbbreviation}:</strong> ${abbrInfo.meaning}`;
        }
    }

    async playCurrentAbbreviation() {
        if (this.currentAbbreviation) {
            await morseAudio.playText(this.currentAbbreviation);
        }
    }

    checkAbbreviation() {
        const input = document.getElementById('abbr-input');
        if (!input || !this.currentAbbreviation) return;
        
        const userAnswer = input.value.trim().toUpperCase();
        const correct = userAnswer === this.currentAbbreviation;
        
        // Reveal the abbreviation
        this.revealAbbreviation();
        
        morseStorage.recordAttempt(correct);
        
        if (correct) {
            this.showFeedback('abbr-feedback', '✓ Correct! Great job!', 'correct');
            setTimeout(() => this.nextAbbreviation(), 2000);
        } else {
            this.showFeedback('abbr-feedback', `✗ Try again! Heard: ${this.currentAbbreviation}`, 'wrong');
        }
        
        this.updateStats();
    }

    // Handle keyboard input for abbreviation practice
    handleAbbrKey(key) {
        const input = document.getElementById('abbr-input');
        if (input) {
            input.value += key;
        }
    }

    handleAbbrClear() {
        const input = document.getElementById('abbr-input');
        if (input) {
            input.value = '';
        }
    }

    handleAbbrEnter() {
        this.checkAbbreviation();
    }

    // Callsign Practice
    nextCallsign() {
        const callsign = generateCallsign();
        this.currentCallsign = callsign;
        
        // Hide the callsign with blur effect
        const display = document.getElementById('callsign-display');
        if (display) {
            display.textContent = '?????';
            display.style.filter = 'blur(8px)';
            display.style.opacity = '0.3';
        }
        
        const input = document.getElementById('callsign-input');
        if (input) {
            input.value = '';
            // Don't auto-focus to prevent virtual keyboard from popping up on mobile
        }
        
        this.hideFeedback('callsign-feedback');
        
        // Auto-play the callsign after a short delay
        setTimeout(async () => {
            if (this.currentCallsign) {
                await morseAudio.playText(this.currentCallsign);
            }
        }, 500);
    }

    revealCallsign() {
        const display = document.getElementById('callsign-display');
        if (display && this.currentCallsign) {
            display.textContent = this.currentCallsign;
            display.style.filter = 'none';
            display.style.opacity = '1';
        }
    }

    async playCurrentCallsign() {
        if (this.currentCallsign) {
            await morseAudio.playText(this.currentCallsign);
        }
    }

    checkCallsign() {
        const input = document.getElementById('callsign-input');
        if (!input || !this.currentCallsign) return;
        
        const userAnswer = input.value.trim().toUpperCase();
        const correct = userAnswer === this.currentCallsign;
        
        // Reveal the callsign
        this.revealCallsign();
        
        morseStorage.recordAttempt(correct);
        
        if (correct) {
            this.showFeedback('callsign-feedback', '✓ Correct! Good copy!', 'correct');
            setTimeout(() => this.nextCallsign(), 1500);
        } else {
            this.showFeedback('callsign-feedback', `✗ Try again! Heard: ${this.currentCallsign}`, 'wrong');
        }
        
        this.updateStats();
    }

    // Handle keyboard input for callsign practice
    handleCallsignKey(key) {
        const input = document.getElementById('callsign-input');
        if (input) {
            input.value += key;
            // Trigger input event for auto-check
            input.dispatchEvent(new Event('input'));
        }
    }

    handleCallsignClear() {
        const input = document.getElementById('callsign-input');
        if (input) {
            input.value = '';
            // Don't auto-focus to prevent virtual keyboard from popping up on mobile
        }
    }

    handleCallsignEnter() {
        this.checkCallsign();
    }

    // Q-Code Practice
    nextQCode() {
        const qcodes = Object.keys(Q_CODES);
        this.currentQCode = qcodes[Math.floor(Math.random() * qcodes.length)];
        
        // Hide the Q-Code with blur effect
        const display = document.getElementById('qcode-display');
        const meaningDisplay = document.getElementById('qcode-meaning');
        if (display) {
            display.textContent = '????';
            display.style.filter = 'blur(8px)';
            display.style.opacity = '0.3';
        }
        if (meaningDisplay) {
            meaningDisplay.style.display = 'none';
            meaningDisplay.textContent = '';
        }
        
        const input = document.getElementById('qcode-input');
        if (input) {
            input.value = '';
        }
        
        this.hideFeedback('qcode-feedback');
        
        // Auto-play the Q-Code after a short delay
        setTimeout(async () => {
            if (this.currentQCode) {
                await morseAudio.playText(this.currentQCode);
            }
        }, 500);
    }

    revealQCode() {
        const display = document.getElementById('qcode-display');
        const meaningDisplay = document.getElementById('qcode-meaning');
        if (display && this.currentQCode) {
            display.textContent = this.currentQCode;
            display.style.filter = 'none';
            display.style.opacity = '1';
        }
        if (meaningDisplay && this.currentQCode) {
            const qcodeInfo = Q_CODES[this.currentQCode];
            meaningDisplay.style.display = 'block';
            meaningDisplay.innerHTML = `<strong>Question:</strong> ${qcodeInfo.meaning}<br><strong>Response:</strong> ${qcodeInfo.response}`;
        }
    }

    async playCurrentQCode() {
        if (this.currentQCode) {
            await morseAudio.playText(this.currentQCode);
        }
    }

    checkQCode() {
        const input = document.getElementById('qcode-input');
        if (!input || !this.currentQCode) return;
        
        const userAnswer = input.value.trim().toUpperCase();
        const correct = userAnswer === this.currentQCode;
        
        // Reveal the Q-Code
        this.revealQCode();
        
        morseStorage.recordAttempt(correct);
        
        if (correct) {
            this.showFeedback('qcode-feedback', '✓ Correct! Well done!', 'correct');
            setTimeout(() => this.nextQCode(), 2000);
        } else {
            this.showFeedback('qcode-feedback', `✗ Try again! Heard: ${this.currentQCode}`, 'wrong');
        }
        
        this.updateStats();
    }

    // Handle keyboard input for Q-Code practice
    handleQCodeKey(key) {
        const input = document.getElementById('qcode-input');
        if (input) {
            input.value += key;
        }
    }

    handleQCodeClear() {
        const input = document.getElementById('qcode-input');
        if (input) {
            input.value = '';
        }
    }

    handleQCodeEnter() {
        this.checkQCode();
    }

    // Prosign Practice
    nextProsign() {
        const prosigns = Object.keys(PROSIGNS);
        this.currentProsign = prosigns[Math.floor(Math.random() * prosigns.length)];
        
        // Hide the Prosign with blur effect
        const display = document.getElementById('prosign-display');
        const meaningDisplay = document.getElementById('prosign-meaning');
        if (display) {
            display.textContent = '????';
            display.style.filter = 'blur(8px)';
            display.style.opacity = '0.3';
        }
        if (meaningDisplay) {
            meaningDisplay.style.display = 'none';
            meaningDisplay.textContent = '';
        }
        
        const input = document.getElementById('prosign-input');
        if (input) {
            input.value = '';
        }
        
        this.hideFeedback('prosign-feedback');
        
        // Auto-play the Prosign after a short delay
        setTimeout(async () => {
            if (this.currentProsign) {
                await morseAudio.playProsign(PROSIGNS[this.currentProsign].code, this.currentProsign);
            }
        }, 500);
    }

    revealProsign() {
        const display = document.getElementById('prosign-display');
        const meaningDisplay = document.getElementById('prosign-meaning');
        if (display && this.currentProsign) {
            display.textContent = this.currentProsign;
            display.style.filter = 'none';
            display.style.opacity = '1';
        }
        if (meaningDisplay && this.currentProsign) {
            const prosignInfo = PROSIGNS[this.currentProsign];
            meaningDisplay.style.display = 'block';
            meaningDisplay.innerHTML = `<strong>${this.currentProsign}:</strong> ${prosignInfo.meaning}`;
        }
    }

    async playCurrentProsign() {
        if (this.currentProsign) {
            await morseAudio.playProsign(PROSIGNS[this.currentProsign].code, this.currentProsign);
        }
    }

    checkProsign() {
        const input = document.getElementById('prosign-input');
        if (!input || !this.currentProsign) return;
        
        const userAnswer = input.value.trim().toUpperCase();
        const correct = userAnswer === this.currentProsign;
        
        // Reveal the Prosign
        this.revealProsign();
        
        morseStorage.recordAttempt(correct);
        
        if (correct) {
            this.showFeedback('prosign-feedback', '✓ Correct! Great job!', 'correct');
            setTimeout(() => this.nextProsign(), 2000);
        } else {
            this.showFeedback('prosign-feedback', `✗ Try again! Heard: ${this.currentProsign}`, 'wrong');
        }
        
        this.updateStats();
    }

    // Handle keyboard input for Prosign practice
    handleProsignKey(key) {
        const input = document.getElementById('prosign-input');
        if (input) {
            input.value += key;
        }
    }

    handleProsignClear() {
        const input = document.getElementById('prosign-input');
        if (input) {
            input.value = '';
        }
    }

    handleProsignEnter() {
        this.checkProsign();
    }

    // QSO Practice
    nextQSO() {
        const qso = generateRandomQSO();
        this.currentQSO = qso;
        
        const transcript = document.getElementById('qso-transcript');
        const translation = document.getElementById('qso-translation');
        
        if (transcript) {
            let html = '';
            qso.turns.forEach((turn, index) => {
                const color = index % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)';
                const label = index % 2 === 0 ? 'DX' : 'ME';
                html += `<p style="margin-bottom: 0.5rem;"><span style="color: ${color}; font-weight: 600;">${label}:</span> <span style="color: var(--text-secondary);">${turn.message}</span></p>`;
            });
            transcript.innerHTML = html;
        }
        
        if (translation) {
            translation.style.display = 'none';
            let html = `<p style="font-weight: 600; margin-bottom: 0.75rem; color: var(--accent-green);">${qso.name}</p>`;
            qso.turns.forEach((turn, index) => {
                const label = index % 2 === 0 ? 'DX' : 'ME';
                html += `<p style="margin-bottom: 0.5rem;"><strong>${label}:</strong> ${turn.translation}</p>`;
            });
            translation.innerHTML = html;
        }
    }

    async playQSOMessage() {
        if (this.currentQSO && this.currentQSO.turns.length > 0) {
            const message = this.currentQSO.turns[0].message;
            await morseAudio.playText(message);
        }
    }

    toggleQSOAnswer() {
        const translation = document.getElementById('qso-translation');
        if (translation) {
            translation.style.display = translation.style.display === 'none' ? 'block' : 'none';
        }
    }

    // ==========================================
    // CW COMMUNICATION PRACTICE - Listen, Read & Send, Two-way QSO
    // ==========================================
    
    // CW Practice - Listen & Type
    nextCWListen() {
        const qso = generateRandomQSO();
        // Pick a random turn from the QSO
        const turnIndex = Math.floor(Math.random() * qso.turns.length);
        this.cwListenSentence = qso.turns[turnIndex];
        
        const input = document.getElementById('cw-listen-input');
        if (input) input.value = '';
        
        this.hideFeedback('cw-listen-feedback');
        
        const translation = document.getElementById('cw-listen-translation');
        if (translation) translation.style.display = 'none';
    }

    async playCWListen() {
        if (this.cwListenSentence) {
            await morseAudio.playText(this.cwListenSentence.message);
        }
    }

    showCWListenHint() {
        const translation = document.getElementById('cw-listen-translation');
        const meaning = document.getElementById('cw-listen-meaning');
        
        if (translation && meaning && this.cwListenSentence) {
            meaning.textContent = this.cwListenSentence.translation;
            translation.style.display = 'block';
        }
    }

    checkCWListen() {
        const input = document.getElementById('cw-listen-input');
        if (!input || !this.cwListenSentence) return;
        
        const userAnswer = input.value.trim().toUpperCase();
        const correct = userAnswer === this.cwListenSentence.message.toUpperCase();
        
        morseStorage.recordAttempt(correct);
        
        if (correct) {
            this.showFeedback('cw-listen-feedback', '✓ Correct! Well done!', 'correct');
            this.showCWListenHint();
            setTimeout(() => this.nextCWListen(), 2500);
        } else {
            this.showFeedback('cw-listen-feedback', `✗ Not quite. Try again!`, 'wrong');
        }
        
        this.updateStats();
    }

    // CW Practice - Read & Send
    nextCWRead() {
        const sentences = [
            { text: "CQ CQ CQ DE K1ABC K", meaning: "Calling any station from K1ABC" },
            { text: "R R FB OM UR 599", meaning: "Roger roger, fine business old man, your signal 599" },
            { text: "NAME JOHN QTH BOSTON", meaning: "Name is John, location Boston" },
            { text: "WX HR IS SUNNY 25C", meaning: "Weather here is sunny, 25 degrees C" },
            { text: "TNX FER QSO 73 ES GB", meaning: "Thanks for QSO, 73 and good bye" },
            { text: "RIG HR IS IC7300 PWR 100W", meaning: "Rig here is IC7300, power 100 watts" },
            { text: "ANT IS DIPOLE AT 10M", meaning: "Antenna is dipole at 10 meters" },
            { text: "GM OM UR RST 599 599", meaning: "Good morning old man, your RST 599" }
        ];
        
        this.cwReadSentence = sentences[Math.floor(Math.random() * sentences.length)];
        this.cwReadInput = '';
        
        const textEl = document.getElementById('cw-read-text');
        const meaningEl = document.getElementById('cw-read-meaning');
        const preview = document.getElementById('cw-read-input-preview');
        
        if (textEl) textEl.textContent = this.cwReadSentence.text;
        if (meaningEl) meaningEl.textContent = this.cwReadSentence.meaning;
        if (preview) {
            preview.innerHTML = '<span class="placeholder">Your Morse code...</span>';
            preview.classList.remove('has-input');
        }
        
        this.hideFeedback('cw-read-feedback');
    }

    handleCWReadInput(symbol) {
        if (this.cwReadInput.length < 50) {
            this.cwReadInput += symbol;
            this.updateCWReadDisplay();
            
            // Auto-submit if answer is correct
            if (this.cwReadSentence && this.cwReadInput === this.textToMorse(this.cwReadSentence.text)) {
                setTimeout(() => this.checkCWRead(), 300);
            }
        }
    }

    clearCWReadInput() {
        this.cwReadInput = '';
        this.updateCWReadDisplay();
    }

    updateCWReadDisplay() {
        const preview = document.getElementById('cw-read-input-preview');
        if (preview) {
            if (this.cwReadInput) {
                preview.textContent = this.cwReadInput;
                preview.classList.add('has-input');
            } else {
                preview.innerHTML = '<span class="placeholder">Your Morse code...</span>';
                preview.classList.remove('has-input');
            }
        }
    }

    checkCWRead() {
        if (!this.cwReadSentence || !this.cwReadInput) return;
        
        const correct = this.textToMorse(this.cwReadSentence.text) === this.cwReadInput;
        
        morseStorage.recordAttempt(correct);
        
        if (correct) {
            this.showFeedback('cw-read-feedback', '✓ Perfect! Correct Morse code!', 'correct');
            setTimeout(() => this.nextCWRead(), 2000);
        } else {
            const correctMorse = this.textToMorse(this.cwReadSentence.text);
            this.showFeedback('cw-read-feedback', `✗ Try again! Answer: ${correctMorse}`, 'wrong');
        }
        
        this.updateStats();
    }

    textToMorse(text) {
        return text.toUpperCase().split('').map(char => {
            if (char === ' ') return ' ';
            return MORSE_CODE[char] || '';
        }).join(' ');
    }

    // CW Practice - Two-way Simulation
    startNewTwoWay() {
        this.currentTwoWayQSO = generateRandomQSO();
        this.twoWayTurnIndex = 0;
        this.twoWayInput = '';
        
        const transcript = document.getElementById('twoway-transcript');
        const inputArea = document.getElementById('twoway-input-area');
        const complete = document.getElementById('twoway-complete');
        
        if (transcript) {
            // Show first turn (DX calls)
            const firstTurn = this.currentTwoWayQSO.turns[0];
            transcript.innerHTML = `
                <div class="twoway-turn dx-turn">
                    <span style="color: var(--accent-cyan); font-weight: 600;">DX:</span>
                    <span style="color: var(--text-secondary);">${firstTurn.message}</span>
                </div>
            `;
        }
        
        if (inputArea) inputArea.style.display = 'block';
        if (complete) complete.style.display = 'none';
        
        const preview = document.getElementById('twoway-input-preview');
        if (preview) {
            preview.innerHTML = '<span class="placeholder">Tap Morse code to reply...</span>';
            preview.classList.remove('has-input');
        }
        
        this.hideFeedback('twoway-feedback');
        
        // Play first message
        setTimeout(async () => {
            if (this.currentTwoWayQSO) {
                await morseAudio.playText(this.currentTwoWayQSO.turns[0].message);
            }
        }, 500);
    }

    handleTwoWayInput(symbol) {
        if (this.twoWayInput.length < 100) {
            this.twoWayInput += symbol;
            this.updateTwoWayDisplay();
            
            // Auto-submit if answer is correct
            if (this.currentTwoWayQSO && this.twoWayTurnIndex + 1 < this.currentTwoWayQSO.turns.length) {
                const expectedTurn = this.currentTwoWayQSO.turns[this.twoWayTurnIndex + 1];
                const expectedMorse = this.textToMorse(expectedTurn.message);
                if (this.twoWayInput === expectedMorse) {
                    setTimeout(() => this.submitTwoWayResponse(), 300);
                }
            }
        }
    }

    clearTwoWayInput() {
        this.twoWayInput = '';
        this.updateTwoWayDisplay();
    }

    updateTwoWayDisplay() {
        const preview = document.getElementById('twoway-input-preview');
        if (preview) {
            if (this.twoWayInput) {
                preview.textContent = this.twoWayInput;
                preview.classList.add('has-input');
            } else {
                preview.innerHTML = '<span class="placeholder">Tap Morse code to reply...</span>';
                preview.classList.remove('has-input');
            }
        }
    }

    async submitTwoWayResponse() {
        if (!this.currentTwoWayQSO || !this.twoWayInput) return;
        
        const expectedTurn = this.currentTwoWayQSO.turns[this.twoWayTurnIndex + 1];
        if (!expectedTurn) return;
        
        const expectedMorse = this.textToMorse(expectedTurn.message);
        const correct = this.twoWayInput === expectedMorse;
        
        morseStorage.recordAttempt(correct);
        
        // Add user's response to transcript
        const transcript = document.getElementById('twoway-transcript');
        if (transcript) {
            transcript.innerHTML += `
                <div class="twoway-turn me-turn">
                    <span style="color: var(--accent-purple); font-weight: 600;">ME:</span>
                    <span style="color: var(--text-secondary);">${expectedTurn.message}</span>
                </div>
            `;
            transcript.scrollTop = transcript.scrollHeight;
        }
        
        this.twoWayTurnIndex += 2; // Skip to next DX turn
        
        if (this.twoWayTurnIndex >= this.currentTwoWayQSO.turns.length) {
            // QSO Complete
            const inputArea = document.getElementById('twoway-input-area');
            const complete = document.getElementById('twoway-complete');
            if (inputArea) inputArea.style.display = 'none';
            if (complete) complete.style.display = 'block';
            
            if (correct) {
                this.showFeedback('twoway-feedback', '✓ QSO Complete! Excellent work!', 'correct');
            } else {
                this.showFeedback('twoway-feedback', `QSO Complete! Expected: ${expectedMorse}`, 'wrong');
            }
        } else {
            // Continue with next DX message
            this.twoWayInput = '';
            this.updateTwoWayDisplay();
            
            const nextTurn = this.currentTwoWayQSO.turns[this.twoWayTurnIndex];
            
            setTimeout(async () => {
                if (transcript) {
                    transcript.innerHTML += `
                        <div class="twoway-turn dx-turn">
                            <span style="color: var(--accent-cyan); font-weight: 600;">DX:</span>
                            <span style="color: var(--text-secondary);">${nextTurn.message}</span>
                        </div>
                    `;
                    transcript.scrollTop = transcript.scrollHeight;
                }
                
                // Play next message
                await morseAudio.playText(nextTurn.message);
            }, 1000);
            
            if (correct) {
                this.showFeedback('twoway-feedback', '✓ Good response!', 'correct');
                setTimeout(() => this.hideFeedback('twoway-feedback'), 1500);
            } else {
                this.showFeedback('twoway-feedback', `Expected: ${expectedMorse}`, 'wrong');
            }
        }
        
        this.updateStats();
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MorseApp();
});
