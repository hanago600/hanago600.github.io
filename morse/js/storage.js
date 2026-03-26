// Storage Controller for Progress Tracking
class MorseStorage {
    constructor() {
        this.key = 'morseCodeApp';
        this.defaultData = {
            stats: {
                totalAttempts: 0,
                correctAttempts: 0,
                streak: 0,
                bestStreak: 0,
                sessionsCompleted: 0
            },
            progress: {
                lettersLearned: [],
                letterAccuracy: {},
                averageWPM: 15
            },
            settings: {
                wpm: 15,
                frequency: 800,
                volume: 0.5,
                theme: 'dark'
            }
        };
    }

    // Get all data
    getData() {
        try {
            const data = localStorage.getItem(this.key);
            if (!data) return this.getDefaultData();
            
            const parsed = JSON.parse(data);
            // Migrate old data structure if needed
            if (!parsed.progress) {
                parsed.progress = this.getDefaultData().progress;
            }
            if (!parsed.progress.letterAccuracy) {
                parsed.progress.letterAccuracy = {};
            }
            if (!parsed.progress.lettersLearned) {
                parsed.progress.lettersLearned = [];
            }
            if (!parsed.progress.averageWPM) {
                parsed.progress.averageWPM = 15;
            }
            return parsed;
        } catch (e) {
            console.warn('Storage access denied or unavailable');
            return this.getDefaultData();
        }
    }

    // Save all data
    saveData(data) {
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch (e) {
            console.warn('Storage save failed');
        }
    }

    // Get default data structure
    getDefaultData() {
        return JSON.parse(JSON.stringify(this.defaultData));
    }

    // Get stats
    getStats() {
        return this.getData().stats;
    }

    // Update stats
    updateStats(callback) {
        const data = this.getData();
        data.stats = callback(data.stats) || data.stats;
        this.saveData(data);
        return data.stats;
    }

    // Record attempt
    recordAttempt(correct) {
        return this.updateStats(stats => {
            stats.totalAttempts++;
            if (correct) {
                stats.correctAttempts++;
                stats.streak++;
                if (stats.streak > stats.bestStreak) {
                    stats.bestStreak = stats.streak;
                }
            } else {
                stats.streak = 0;
            }
            return stats;
        });
    }

    // Get accuracy percentage
    getAccuracy() {
        const stats = this.getStats();
        if (stats.totalAttempts === 0) return 0;
        return Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
    }

    // Record letter practice
    recordLetterPractice(letter, correct) {
        const data = this.getData();
        
        if (!data.progress.letterAccuracy[letter]) {
            data.progress.letterAccuracy[letter] = { attempts: 0, correct: 0 };
        }
        
        data.progress.letterAccuracy[letter].attempts++;
        if (correct) {
            data.progress.letterAccuracy[letter].correct++;
        }
        
        // Mark as learned if >80% accuracy and at least 5 attempts
        const accuracy = data.progress.letterAccuracy[letter].correct / data.progress.letterAccuracy[letter].attempts;
        if (accuracy >= 0.8 && data.progress.letterAccuracy[letter].attempts >= 5) {
            if (!data.progress.lettersLearned.includes(letter)) {
                data.progress.lettersLearned.push(letter);
            }
        }
        
        this.saveData(data);
    }

    // Get letter accuracy
    getLetterAccuracy(letter) {
        const data = this.getData();
        const acc = data.progress.letterAccuracy[letter];
        if (!acc || acc.attempts === 0) return 0;
        return Math.round((acc.correct / acc.attempts) * 100);
    }

    // Get all learned letters
    getLearnedLetters() {
        return this.getData().progress.lettersLearned;
    }

    // Check if a letter is learned
    isLetterLearned(letter) {
        return this.getLearnedLetters().includes(letter);
    }

    // Get weighted random character - learned chars have reduced frequency
    getWeightedRandomChar(chars) {
        const learnedLetters = this.getLearnedLetters();
        
        // Calculate weights: learned = 0.2, unlearned = 1.0
        const weights = chars.map(char => {
            return learnedLetters.includes(char) ? 0.2 : 1.0;
        });
        
        // Calculate total weight
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        
        // Generate random value
        let random = Math.random() * totalWeight;
        
        // Select character based on weight
        for (let i = 0; i < chars.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return chars[i];
            }
        }
        
        // Fallback to last character
        return chars[chars.length - 1];
    }

    // Get multiple weighted random characters (for quiz)
    getWeightedRandomChars(chars, count) {
        const result = [];
        const available = [...chars];
        
        for (let i = 0; i < count && available.length > 0; i++) {
            const char = this.getWeightedRandomChar(available);
            result.push(char);
            // Remove selected char to avoid duplicates
            const index = available.indexOf(char);
            if (index > -1) {
                available.splice(index, 1);
            }
        }
        
        return result;
    }

    // Get settings
    getSettings() {
        return this.getData().settings;
    }

    // Update settings
    updateSettings(newSettings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...newSettings };
        this.saveData(data);
        return data.settings;
    }

    // Set theme
    setTheme(theme) {
        this.updateSettings({ theme });
    }

    // Get theme
    getTheme() {
        return this.getSettings().theme;
    }

    // Reset all data
    resetAll() {
        this.saveData(this.getDefaultData());
    }

    // Export data
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    }

    // Import data
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.saveData(data);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Create global instance
const morseStorage = new MorseStorage();
