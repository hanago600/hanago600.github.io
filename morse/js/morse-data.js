// Morse Code Dictionary
const MORSE_CODE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

// Reverse lookup (Morse -> Character)
const MORSE_TO_CHAR = {};
for (const [char, morse] of Object.entries(MORSE_CODE)) {
    MORSE_TO_CHAR[morse] = char;
}

// Get all letters A-Z
const LETTERS = Object.keys(MORSE_CODE).filter(c => c.length === 1 && /[A-Z]/.test(c));

// Get all numbers 0-9
const NUMBERS = Object.keys(MORSE_CODE).filter(c => c.length === 1 && /[0-9]/.test(c));

// Get all characters
const ALL_CHARS = [...LETTERS, ...NUMBERS];

// Morse timing constants (in milliseconds)
const TIMING = {
    DOT: 100,           // Length of a dot
    DASH: 300,          // Length of a dash (3x dot)
    SYMBOL_GAP: 100,    // Gap between dots/dashes in a letter
    LETTER_GAP: 300,    // Gap between letters (3x dot)
    WORD_GAP: 700       // Gap between words (7x dot)
};

// Group characters for learning sections
const GROUPS = {
    'E-T': ['E', 'T'],
    'I-A-N-M': ['I', 'A', 'N', 'M'],
    'S-U-R-W-D-K-G-O': ['S', 'U', 'R', 'W', 'D', 'K', 'G', 'O'],
    'H-V-F-L-P-J-B-X-C-Y-Z-Q': ['H', 'V', 'F', 'L', 'P', 'J', 'B', 'X', 'C', 'Y', 'Z', 'Q'],
    'Numbers': NUMBERS
};

// HAM Radio Q-Codes (common ones)
const Q_CODES = {
    'QRL': { meaning: 'Are you busy?', response: 'I am busy' },
    'QRM': { meaning: 'Is there interference?', response: 'I have interference' },
    'QRN': { meaning: 'Are you troubled by static?', response: 'I am troubled by static' },
    'QRO': { meaning: 'Shall I increase power?', response: 'Increase power' },
    'QRP': { meaning: 'Shall I decrease power?', response: 'Decrease power' },
    'QRQ': { meaning: 'Shall I send faster?', response: 'Send faster' },
    'QRS': { meaning: 'Shall I send slower?', response: 'Send slower' },
    'QRT': { meaning: 'Shall I stop sending?', response: 'Stop sending' },
    'QRU': { meaning: 'Do you have anything for me?', response: 'I have nothing for you' },
    'QRV': { meaning: 'Are you ready?', response: 'I am ready' },
    'QRX': { meaning: 'When will you call me?', response: 'I will call you at...' },
    'QRZ': { meaning: 'Who is calling me?', response: 'You are being called by...' },
    'QSB': { meaning: 'Are my signals fading?', response: 'Your signals are fading' },
    'QSL': { meaning: 'Can you acknowledge receipt?', response: 'I acknowledge receipt' },
    'QSO': { meaning: 'Can you communicate with...?', response: 'I can communicate with...' },
    'QSY': { meaning: 'Shall I change frequency?', response: 'Change frequency to...' },
    'QTH': { meaning: 'What is your location?', response: 'My location is...' },
    'QTR': { meaning: 'What is your time?', response: 'My time is...' }
};

// Prosigns (procedural signals)
const PROSIGNS = {
    'AR': { code: '.-.-.', meaning: 'End of message' },
    'AS': { code: '.-...', meaning: 'Wait' },
    'BK': { code: '-...-.-', meaning: 'Break' },
    'CL': { code: '-.-..-..', meaning: 'Closing station' },
    'CQ': { code: '-.-.--.-', meaning: 'Calling all stations' },
    'DE': { code: '-...', meaning: 'From/This is' },
    'K': { code: '-.-', meaning: 'Go ahead/Over' },
    'KN': { code: '-.--.', meaning: 'Go ahead (specific station)' },
    'SK': { code: '...-.-', meaning: 'End of contact' },
    'BT': { code: '-...-', meaning: 'Pause/Break in thought' },
    'AA': { code: '.-.-', meaning: 'New line' },
    'CT': { code: '-.-.-', meaning: 'Attention' },
    'SOS': { code: '...---...', meaning: 'Distress' }
};

// Common abbreviations
const ABBREVIATIONS = {
    'R': { meaning: 'Roger/Received' },
    'C': { meaning: 'Yes/Correct' },
    'N': { meaning: 'No' },
    'UR': { meaning: 'Your' },
    'MY': { meaning: 'My' },
    'NAME': { meaning: 'Name is' },
    'QTH': { meaning: 'Location' },
    'RST': { meaning: 'Signal report' },
    '599': { meaning: 'Perfect signal' },
    'GM': { meaning: 'Good morning' },
    'GA': { meaning: 'Good afternoon' },
    'GE': { meaning: 'Good evening' },
    'CU': { meaning: 'See you' },
    '73': { meaning: 'Best regards' },
    '88': { meaning: 'Love and kisses' },
    'FB': { meaning: 'Fine business/Excellent' },
    'OM': { meaning: 'Old man (any male)' },
    'YL': { meaning: 'Young lady (female)' },
    'XYL': { meaning: 'Wife' },
    'ES': { meaning: 'And' },
    'DX': { meaning: 'Long distance' },
    'TX': { meaning: 'Transmit' },
    'RX': { meaning: 'Receive' },
    'ANT': { meaning: 'Antenna' },
    'PWR': { meaning: 'Power' },
    'FER': { meaning: 'For' },
    'PSE': { meaning: 'Please' },
    'TNX': { meaning: 'Thanks' },
    'TU': { meaning: 'Thank you' },
    'HW': { meaning: 'How' },
    'CPI': { meaning: 'Copy' },
    'CFM': { meaning: 'Confirm' }
};

// CW Communication Practice - QSO Templates
const QSO_TEMPLATES = [
    {
        name: "Initial Contact",
        turns: [
            { sender: "DX", message: "CQ CQ CQ DE {MY_CALL} {MY_CALL} K", translation: "Calling any station from {MY_CALL}" },
            { sender: "ME", message: "{MY_CALL} DE {UR_CALL} {UR_CALL} UR 599 599 NAME {UR_NAME} QTH {UR_QTH} HW?", translation: "From {MY_CALL}, this is {UR_CALL}. Your signal 599. Name is {UR_NAME}. Location {UR_QTH}. How copy?" },
            { sender: "DX", message: "R R FB {UR_NAME} UR 599 ALSO NAME {MY_NAME} QTH {MY_QTH} ES TNX FER CALL", translation: "Roger roger, fine business {UR_NAME}. Your signal 599 also. Name is {MY_NAME}. Location {MY_QTH}. Thanks for the call" },
            { sender: "ME", message: "CPI 5NN TNX FER QSO 73 ES GB {MY_CALL} DE {UR_CALL} SK", translation: "Copy 599. Thanks for QSO. Best regards and good bye. From {MY_CALL}, this is {UR_CALL} ending" }
        ]
    },
    {
        name: "Signal Report Exchange",
        turns: [
            { sender: "DX", message: "{UR_CALL} DE {MY_CALL} GM UR RST?", translation: "From {UR_CALL}, this is {MY_CALL}. Good morning. Your RST?" },
            { sender: "ME", message: "{MY_CALL} DE {UR_CALL} GM UR 5NN 5NN FB", translation: "From {MY_CALL}, this is {UR_CALL}. Good morning. Your signal 599. Fine business" },
            { sender: "DX", message: "R R TNX 73 {MY_CALL} DE {UR_CALL} SK", translation: "Roger roger. Thanks. 73. From {MY_CALL}, this is {UR_CALL} ending" }
        ]
    },
    {
        name: "Weather Chat",
        turns: [
            { sender: "DX", message: "{UR_CALL} DE {MY_CALL} UR WX HR?", translation: "From {UR_CALL}, this is {MY_CALL}. Your weather here?" },
            { sender: "ME", message: "{MY_CALL} DE {UR_CALL} WX HR IS {WX} {TEMP}C FB", translation: "From {MY_CALL}, this is {UR_CALL}. Weather here is {WX}, {TEMP} degrees C. Fine business" },
            { sender: "DX", message: "R R WX HR IS {WX2} {TEMP2}C TNX FER INFO 73", translation: "Roger roger. Weather here is {WX2}, {TEMP2} degrees C. Thanks for info. 73" }
        ]
    },
    {
        name: "Equipment Discussion",
        turns: [
            { sender: "DX", message: "{UR_CALL} DE {MY_CALL} UR RIG?", translation: "From {UR_CALL}, this is {MY_CALL}. Your rig/equipment?" },
            { sender: "ME", message: "{MY_CALL} DE {UR_CALL} HR RIG IS {RIG} PWR {PWR}W ANT {ANT}", translation: "From {MY_CALL}, this is {UR_CALL}. Here rig is {RIG}, power {PWR} watts, antenna {ANT}" },
            { sender: "DX", message: "R R FB RIG HR IS {RIG2} PWR {PWR2}W 73 ES GB", translation: "Roger roger, fine business. Rig here is {RIG2}, power {PWR2} watts. 73 and good bye" }
        ]
    },
    {
        name: "Contest Exchange",
        turns: [
            { sender: "DX", message: "CQ TEST DE {MY_CALL} {MY_CALL}", translation: "Calling contest from {MY_CALL}" },
            { sender: "ME", message: "{MY_CALL} DE {UR_CALL} {UR_CALL} 5NN {SERNO}", translation: "From {MY_CALL}, this is {UR_CALL}. 599, serial number {SERNO}" },
            { sender: "DX", message: "R {UR_CALL} 5NN {SERNO2} TU", translation: "Roger {UR_CALL}. 599, serial number {SERNO2}. Thank you" }
        ]
    }
];

// Data generators for random QSOs
const CALLSIGNS = ['K1ABC', 'W2XYZ', 'N3DEF', 'WA4GHI', 'KB5JKL', 'K6MNO', 'W7PQR', 'N8STU', 'K9VWX', 'W0YZA', 'JA1ABC', 'JA2DEF', 'DL3GHI', 'G4JKL', 'F5MNO', 'EA6PQR', 'I7STU', 'VK8VWX', 'ZL9YZA', 'VE1ABC'];
const NAMES = ['JOHN', 'MIKE', 'DAVID', 'CHRIS', 'PAUL', 'MARK', 'JAMES', 'ROBERT', 'TOM', 'BILL', 'MARY', 'SUSAN', 'LINDA', 'KAREN', 'LISA', 'NANCY', 'BETTY', 'HELEN', 'SANDY', 'CAROL'];
const LOCATIONS = ['BOSTON', 'NEW YORK', 'CHICAGO', 'MIAMI', 'SEATTLE', 'DENVER', 'AUSTIN', 'PORTLAND', 'PHOENIX', 'DALLAS', 'LONDON', 'PARIS', 'BERLIN', 'TOKYO', 'SYDNEY', 'TORONTO', 'MADRID', 'ROME', 'OSLO', 'STOCKHOLM'];
const WEATHER = ['SUNNY', 'CLOUDY', 'RAIN', 'CLEAR', 'FOG', 'WINDY', 'SNOW', 'STORM'];
const RIGS = ['IC7300', 'FTDX101', 'K3S', 'IC7610', 'TS890', 'FT991A', 'KX3', 'IC705', 'X6100', 'G90'];
const ANTENNAS = ['DIPOLE', 'VERTICAL', 'YAGI', 'LOOP', 'LONGWIRE', 'BEAM', 'GP', 'RANDOM'];

// Generate random callsign
function generateCallsign() {
    return CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)];
}

// Generate random name
function generateName() {
    return NAMES[Math.floor(Math.random() * NAMES.length)];
}

// Generate random location
function generateLocation() {
    return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}

// Generate random QSO conversation
function generateRandomQSO() {
    const myCall = generateCallsign();
    const urCall = generateCallsign();
    const myName = generateName();
    const urName = generateName();
    const myQth = generateLocation();
    const urQth = generateLocation();
    const wx = WEATHER[Math.floor(Math.random() * WEATHER.length)];
    const wx2 = WEATHER[Math.floor(Math.random() * WEATHER.length)];
    const temp = Math.floor(Math.random() * 35) + 5; // 5-40C
    const temp2 = Math.floor(Math.random() * 35) + 5;
    const rig = RIGS[Math.floor(Math.random() * RIGS.length)];
    const rig2 = RIGS[Math.floor(Math.random() * RIGS.length)];
    const pwr = [5, 10, 50, 100][Math.floor(Math.random() * 4)];
    const pwr2 = [5, 10, 50, 100][Math.floor(Math.random() * 4)];
    const ant = ANTENNAS[Math.floor(Math.random() * ANTENNAS.length)];
    const serNo = Math.floor(Math.random() * 999) + 1;
    const serNo2 = Math.floor(Math.random() * 999) + 1;
    
    // Pick random template
    const template = QSO_TEMPLATES[Math.floor(Math.random() * QSO_TEMPLATES.length)];
    
    // Replace placeholders
    const conversation = template.turns.map(turn => ({
        sender: turn.sender,
        message: turn.message
            .replace(/{MY_CALL}/g, myCall)
            .replace(/{UR_CALL}/g, urCall)
            .replace(/{MY_NAME}/g, myName)
            .replace(/{UR_NAME}/g, urName)
            .replace(/{MY_QTH}/g, myQth)
            .replace(/{UR_QTH}/g, urQth)
            .replace(/{WX}/g, wx)
            .replace(/{WX2}/g, wx2)
            .replace(/{TEMP}/g, temp)
            .replace(/{TEMP2}/g, temp2)
            .replace(/{RIG}/g, rig)
            .replace(/{RIG2}/g, rig2)
            .replace(/{PWR}/g, pwr)
            .replace(/{PWR2}/g, pwr2)
            .replace(/{ANT}/g, ant)
            .replace(/{SERNO}/g, serNo)
            .replace(/{SERNO2}/g, serNo2),
        translation: turn.translation
            .replace(/{MY_CALL}/g, myCall)
            .replace(/{UR_CALL}/g, urCall)
            .replace(/{MY_NAME}/g, myName)
            .replace(/{UR_NAME}/g, urName)
            .replace(/{MY_QTH}/g, myQth)
            .replace(/{UR_QTH}/g, urQth)
            .replace(/{WX}/g, wx)
            .replace(/{WX2}/g, wx2)
            .replace(/{TEMP}/g, temp)
            .replace(/{TEMP2}/g, temp2)
            .replace(/{RIG}/g, rig)
            .replace(/{RIG2}/g, rig2)
            .replace(/{PWR}/g, pwr)
            .replace(/{PWR2}/g, pwr2)
            .replace(/{ANT}/g, ant)
            .replace(/{SERNO}/g, serNo)
            .replace(/{SERNO2}/g, serNo2)
    }));
    
    return {
        name: template.name,
        turns: conversation
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        MORSE_CODE, MORSE_TO_CHAR, LETTERS, NUMBERS, ALL_CHARS, TIMING, GROUPS,
        Q_CODES, PROSIGNS, ABBREVIATIONS, QSO_TEMPLATES,
        generateCallsign, generateName, generateLocation, generateRandomQSO
    };
}
