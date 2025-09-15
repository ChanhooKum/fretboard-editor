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
    const numStrings = tuningInputs.length;
    const inlayFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

    fretboardContainer.innerHTML = '';

    const fretboard = document.createElement('div');
    fretboard.classList.add('fretboard');
    fretboard.style.width = `${(endFret - startFret + 1) * 60}px`;

    const topBorder = document.createElement('div');
    topBorder.classList.add('fretboard-border', 'top');
    fretboard.appendChild(topBorder);

    const bottomBorder = document.createElement('div');
    bottomBorder.classList.add('fretboard-border', 'bottom');
    fretboard.appendChild(bottomBorder);

    // Create strings
    for (let i = 0; i < numStrings; i++) {
        const string = document.createElement('div');
        string.classList.add('string');
        string.style.top = `${(i * 40) + 20}px`;
        fretboard.appendChild(string);
    }

    // Create frets (vertical lines)
    for (let i = startFret; i <= endFret; i++) {
        if (i === 0) continue;
        const fret = document.createElement('div');
        fret.classList.add('fret');
        fret.style.left = `${(i - startFret) * 60}px`;
        fretboard.appendChild(fret);
    }
    
    // Nut
    if (startFret === 0) {
        const nut = document.createElement('div');
        nut.classList.add('nut');
        fretboard.appendChild(nut);
    }

    // Create note positions for dots
    for (let s = 0; s < numStrings; s++) {
        for (let f = startFret; f <= endFret; f++) {
            const notePosition = document.createElement('div');
            notePosition.classList.add('note-position');
            notePosition.dataset.string = s + 1;
            notePosition.dataset.fret = f;
            notePosition.style.top = `${(s * 40) + 20}px`;
            notePosition.style.left = `${((f - startFret) * 60) + (f === 0 ? 0 : 30)}px`;
            fretboard.appendChild(notePosition);
        }
    }

    // Create fret numbers
    const fretNumbers = document.createElement('div');
    fretNumbers.classList.add('fret-numbers');
    for (let i = startFret; i <= endFret; i++) {
        const fretNumber = document.createElement('div');
        fretNumber.classList.add('fret-number');
        fretNumber.textContent = i;
        fretNumber.style.left = `${((i - startFret) * 60) + (i === 0 ? 0 : -30)}px`;
        fretNumbers.appendChild(fretNumber);
    }
    fretboard.appendChild(fretNumbers);

    // Create inlay markers
    const inlays = document.createElement('div');
    inlays.classList.add('inlays');
    for (let i = startFret; i <= endFret; i++) {
        if (inlayFrets.includes(i)) {
            const inlay = document.createElement('div');
            inlay.classList.add('inlay');
            inlay.style.left = `${((i - startFret) * 60) - 30}px`;

            if (i % 12 === 0 && i !== 0) { // Double dot for 12, 24, etc.
                const inlay2 = document.createElement('div');
                inlay2.classList.add('inlay');
                inlay2.style.left = inlay.style.left;
                inlay2.style.top = `${(1 * 40) + 40}px`;
                inlays.appendChild(inlay2);
                inlay.style.top = `${(3 * 40) + 40}px`;
            } else {
                inlay.style.top = '120px';
            }
            inlays.appendChild(inlay);
        }
    }
    fretboard.appendChild(inlays);

    fretboardContainer.appendChild(fretboard);
}

// Update display
function updateDisplay() {
    generateFretboard();
    const positions = parsePositions();
    positions.forEach(pos => {
        const note = calculateNote(pos.string, pos.fret);
        const noteDiv = fretboardContainer.querySelector(`.note-position[data-string='${pos.string}'][data-fret='${pos.fret}']`);
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
