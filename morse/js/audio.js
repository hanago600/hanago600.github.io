// Audio Controller for Morse Code
class MorseAudio {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.frequency = 800; // Hz - realistic CW Morse tone (typical radio pitch)
        this.volume = 0.3;
        this.wpm = 15; // Words per minute
        this.timing = this.calculateTiming(this.wpm);
    }

    // Initialize Audio Context (must be called after user interaction)
    async init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Calculate timing based on WPM
    calculateTiming(wpm) {
        // Standard word is "PARIS" = 50 units
        // At 1 WPM, 50 units = 60 seconds, so 1 unit = 1.2 seconds
        // At N WPM, unit = 1.2 / N seconds
        const unitMs = (1.2 / wpm) * 1000;
        return {
            dot: unitMs,
            dash: unitMs * 3,
            symbolGap: unitMs,
            letterGap: unitMs * 3,
            wordGap: unitMs * 7
        };
    }

    // Set playback speed (WPM)
    setWPM(wpm) {
        this.wpm = Math.max(5, Math.min(40, wpm));
        this.timing = this.calculateTiming(this.wpm);
    }

    // Set frequency
    setFrequency(freq) {
        this.frequency = freq;
    }

    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // Play a single tone
    async playTone(duration) {
        // Ensure audio context is initialized and resumed
        if (!this.audioContext) {
            this.init();
        }
        
        // Wait for audio context to be ready (critical for browsers)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        return new Promise(resolve => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.frequency.value = this.frequency;
            osc.type = 'sine';

            // Sharp envelope for realistic CW radio tone
            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(this.volume, now + 0.005);
            gain.gain.setValueAtTime(this.volume, now + duration / 1000 - 0.005);
            gain.gain.linearRampToValueAtTime(0, now + duration / 1000);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(now);
            osc.stop(now + duration / 1000);

            setTimeout(resolve, duration);
        });
    }

    // Play silence for a duration
    async silence(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    // Play a single Morse symbol (dot or dash)
    async playSymbol(symbol) {
        if (symbol === '.') {
            await this.playTone(this.timing.dot);
            await this.silence(this.timing.symbolGap);
        } else if (symbol === '-') {
            await this.playTone(this.timing.dash);
            await this.silence(this.timing.symbolGap);
        }
    }

    // Dispatch play state events for UI updates
    dispatchPlayState(playing) {
        window.dispatchEvent(new CustomEvent('morsePlayState', { detail: { playing } }));
    }

    // Play a character (e.g., 'A' -> '.-')
    async playChar(char) {
        const morse = MORSE_CODE[char.toUpperCase()];
        if (!morse) return;

        this.isPlaying = true;
        this.dispatchPlayState(true);
        for (let i = 0; i < morse.length && this.isPlaying; i++) {
            await this.playSymbol(morse[i]);
            // Add letter gap after character (except we handle this in playText)
        }
        this.isPlaying = false;
        this.dispatchPlayState(false);
    }

    // Play a string of text
    async playText(text) {
        this.isPlaying = true;
        this.dispatchPlayState(true);
        for (let i = 0; i < text.length && this.isPlaying; i++) {
            const char = text[i].toUpperCase();
            if (char === ' ') {
                await this.silence(this.timing.wordGap);
            } else if (MORSE_CODE[char]) {
                const morse = MORSE_CODE[char];
                // Play each symbol in the character
                for (let j = 0; j < morse.length && this.isPlaying; j++) {
                    await this.playTone(morse[j] === '.' ? this.timing.dot : this.timing.dash);
                    // Add symbol gap between symbols in same character
                    if (j < morse.length - 1) {
                        await this.silence(this.timing.symbolGap);
                    }
                }
                // Add letter gap between characters (but not after last character)
                if (i < text.length - 1 && text[i + 1] !== ' ') {
                    await this.silence(this.timing.letterGap);
                }
            }
        }
        this.isPlaying = false;
        this.dispatchPlayState(false);
    }

    // Play a Morse code string directly (e.g., '.-')
    async playMorse(morse) {
        this.isPlaying = true;
        this.dispatchPlayState(true);
        for (let i = 0; i < morse.length && this.isPlaying; i++) {
            await this.playTone(morse[i] === '.' ? this.timing.dot : this.timing.dash);
            // Add symbol gap between symbols
            if (i < morse.length - 1) {
                await this.silence(this.timing.symbolGap);
            }
        }
        this.isPlaying = false;
        this.dispatchPlayState(false);
    }

    // Play a prosign with letter gaps between component characters
    async playProsign(prosignCode, prosignName) {
        // Split the prosign code into individual letters based on the prosign name
        // e.g., AR = A (.-) + R (.-.)
        const letters = prosignName.split('');
        let currentPos = 0;
        
        this.isPlaying = true;
        this.dispatchPlayState(true);
        
        for (let letterIndex = 0; letterIndex < letters.length && this.isPlaying; letterIndex++) {
            const letter = letters[letterIndex];
            const letterCode = MORSE_CODE[letter];
            
            if (!letterCode) continue;
            
            // Play each symbol in the letter
            for (let i = 0; i < letterCode.length && this.isPlaying; i++) {
                await this.playTone(letterCode[i] === '.' ? this.timing.dot : this.timing.dash);
                // Add symbol gap between symbols in the same letter
                if (i < letterCode.length - 1) {
                    await this.silence(this.timing.symbolGap);
                }
            }
            
            // Add letter gap between letters (but not after the last letter)
            if (letterIndex < letters.length - 1) {
                await this.silence(this.timing.letterGap);
            }
        }
        
        this.isPlaying = false;
        this.dispatchPlayState(false);
    }

    // Stop playback
    stop() {
        this.isPlaying = false;
        this.dispatchPlayState(false);
    }

    // Get current settings
    getSettings() {
        return {
            wpm: this.wpm,
            frequency: this.frequency,
            volume: this.volume
        };
    }
}

// Create global instance
const morseAudio = new MorseAudio();
