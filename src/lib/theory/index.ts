/**
 * Music Theory Engine
 *
 * Stateless, pure-function module that computes diatonic harmony for any major key.
 * Handles all 12 major keys with correct enharmonic spelling.
 */

// Chromatic notes in sharp and flat variants
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Keys that use flats for their scale spelling
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']);

// Major scale intervals in semitones: W-W-H-W-W-W-H
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Diatonic chord qualities for major scale degrees 1-7
const DIATONIC_QUALITIES: Quality[] = [
	'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'
];

// Roman numerals by quality convention
const ROMAN_NUMERALS_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const ROMAN_NUMERALS_LOWER = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

// Key pathway order
export const KEY_ORDER = ['C', 'G', 'D', 'F', 'A', 'E', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B'];

export type Quality = 'major' | 'minor' | 'diminished';

export type Chord = {
	name: string;       // "C major", "D minor"
	root: string;       // "C", "D"
	quality: Quality;
	degree: number;     // 1-7
	roman: string;      // "I", "ii", "iii", "IV", "V", "vi", "vii°"
	notes: string[];    // ["C4", "E4", "G4", "C5"] — voiced for playback
};

function noteIndex(note: string): number {
	let idx = SHARP_NOTES.indexOf(note);
	if (idx === -1) idx = FLAT_NOTES.indexOf(note);
	if (idx === -1) throw new Error(`Unknown note: ${note}`);
	return idx;
}

function chromaticNotes(key: string): string[] {
	return FLAT_KEYS.has(key) ? FLAT_NOTES : SHARP_NOTES;
}

/** Get the 7 notes of the major scale for a given key. */
export function getScaleNotes(key: string): string[] {
	const rootIdx = noteIndex(key);
	const notes = chromaticNotes(key);
	return MAJOR_SCALE_INTERVALS.map((interval) => notes[(rootIdx + interval) % 12]);
}

/** Get the formatted Roman numeral for a scale degree and quality. */
export function getRomanNumeral(degree: number, quality: Quality): string {
	const idx = degree - 1;
	if (idx < 0 || idx > 6) throw new Error(`Invalid degree: ${degree}`);
	if (quality === 'major') return ROMAN_NUMERALS_UPPER[idx];
	if (quality === 'minor') return ROMAN_NUMERALS_LOWER[idx];
	return ROMAN_NUMERALS_LOWER[idx] + '°';
}

/**
 * Build a 4-note voicing: root, third, fifth, octave-doubled root.
 * Rooted in the octave around C4–C5.
 */
function voiceChord(root: string, quality: Quality): string[] {
	const rootIdx = noteIndex(root);
	const thirdInterval = quality === 'major' ? 4 : 3;
	const fifthInterval = quality === 'diminished' ? 6 : 7;

	const notes = chromaticNotes(root.replace(/[0-9]/g, ''));

	const rootNote = notes[rootIdx % 12];
	const third = notes[(rootIdx + thirdInterval) % 12];
	const fifth = notes[(rootIdx + fifthInterval) % 12];

	// Place in octave 4, with doubled root at octave 5
	const octave = 4;
	const thirdOctave = (rootIdx + thirdInterval) >= 12 ? octave + 1 : octave;
	const fifthOctave = (rootIdx + fifthInterval) >= 12 ? octave + 1 : octave;

	return [
		`${rootNote}${octave}`,
		`${third}${thirdOctave}`,
		`${fifth}${fifthOctave}`,
		`${rootNote}${octave + 1}`
	];
}

/** Get all 7 diatonic chords for a major key. */
export function getDiatonicChords(key: string): Chord[] {
	const scaleNotes = getScaleNotes(key);

	return scaleNotes.map((root, i) => {
		const degree = i + 1;
		const quality = DIATONIC_QUALITIES[i];
		const roman = getRomanNumeral(degree, quality);
		const qualityLabel = quality === 'diminished' ? 'dim' : quality === 'minor' ? 'min' : 'maj';

		return {
			name: `${root} ${qualityLabel}`,
			root,
			quality,
			degree,
			roman,
			notes: voiceChord(root, quality)
		};
	});
}

/** Get a specific diatonic chord by scale degree. */
export function getChordByDegree(key: string, degree: number): Chord {
	const chords = getDiatonicChords(key);
	const chord = chords.find((c) => c.degree === degree);
	if (!chord) throw new Error(`Invalid degree ${degree} for key ${key}`);
	return chord;
}

/** Reverse lookup: given a chord name, find its degree in the key. */
export function getChordDegree(key: string, chordName: string): number {
	const chords = getDiatonicChords(key);
	const chord = chords.find((c) => c.name === chordName);
	if (!chord) throw new Error(`Chord "${chordName}" not found in key ${key}`);
	return chord.degree;
}
