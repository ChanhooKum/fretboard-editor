const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INTERVALS = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

const NOTE_TO_VAL = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// DOM Elements
const startFretInput = document.getElementById('start-fret');
const endFretInput = document.getElementById('end-fret');
const tuningInputs = document.querySelectorAll('.tuning-input');
const rootNoteSelect = document.getElementById('root-note-select');
const notationSelect = document.getElementById('notation-select');
const positionsInput = document.getElementById('positions-input');
const updateButton = document.getElementById('update-button');
const fretboardContainer = document.getElementById('fretboard-container');

// Fretboard generation
function generateFretboard() {
    const startFret = parseInt(startFretInput.value);
    const endFret = parseInt(endFretInput.value);
    const numFrets = endFret - startFret + 1;
    const numStrings = tuningInputs.length;

    fretboardContainer.innerHTML = ''; // Clear existing fretboard

    const fretboard = document.createElement('div');
    fretboard.classList.add('fretboard');

    // Create header row for fret numbers
    const header = document.createElement('div');
    header.classList.add('fret-numbers');
    for (let fret = startFret; fret <= endFret; fret++) {
        const fretNumber = document.createElement('div');
        fretNumber.classList.add('fret-number');
        fretNumber.textContent = fret;
        header.appendChild(fretNumber);
    }
    fretboard.appendChild(header);

    // Create strings
    for (let i = 0; i < numStrings; i++) {
        const string = document.createElement('div');
        string.classList.add('string');
        for (let fret = startFret; fret <= endFret; fret++) {
            const fretDiv = document.createElement('div');
            fretDiv.classList.add('fret');
            fretDiv.dataset.string = i + 1;
            fretDiv.dataset.fret = fret;
            string.appendChild(fretDiv);
        }
        fretboard.appendChild(string);
    }

    fretboardContainer.appendChild(fretboard);
}

// Update display
function updateDisplay() {
    generateFretboard();
    const positions = parsePositions();
    positions.forEach(pos => {
        const note = calculateNote(pos.string, pos.fret);
        const noteDiv = fretboardContainer.querySelector(`.fret[data-string='${pos.string}'][data-fret='${pos.fret}']`);
        if (noteDiv) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.textContent = getNoteText(note);
            noteDiv.appendChild(dot);
        }
    });
}

// Parse positions from input
function parsePositions() {
    const positionsText = positionsInput.value.trim();
    if (!positionsText) return [];
    return positionsText.split('\n').map(line => {
        const [string, fret] = line.split(',').map(s => parseInt(s.trim()));
        return { string, fret };
    });
}

// Calculate note value
function calculateNote(stringNum, fret) {
    const tuning = Array.from(tuningInputs).map(input => input.value.toUpperCase());
    const openNote = tuning[stringNum - 1];
    const openNoteValue = NOTE_TO_VAL[openNote];
    return (openNoteValue + fret) % 12;
}

// Get note text based on settings
function getNoteText(noteValue) {
    const rootNote = parseInt(rootNoteSelect.value);
    const notation = notationSelect.value;

    if (rootNote === -1 || notation === 'absolute') {
        return NOTES_SHARP[noteValue]; // Default to sharp for absolute
    } else {
        const interval = (noteValue - rootNote + 12) % 12;
        return INTERVALS[interval];
    }
}


// Event Listeners
updateButton.addEventListener('click', updateDisplay);
startFretInput.addEventListener('change', generateFretboard);
endFretInput.addEventListener('change', generateFretboard);


// Initial setup
generateFretboard();