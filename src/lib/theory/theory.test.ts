import { describe, it, expect } from 'vitest';
import {
	getScaleNotes,
	getDiatonicChords,
	getChordByDegree,
	getChordDegree,
	getRomanNumeral,
	KEY_ORDER
} from './index.js';

describe('getScaleNotes', () => {
	it('returns C major scale', () => {
		expect(getScaleNotes('C')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
	});

	it('returns G major scale', () => {
		expect(getScaleNotes('G')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
	});

	it('returns D major scale', () => {
		expect(getScaleNotes('D')).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#']);
	});

	it('returns F major scale (flat key)', () => {
		expect(getScaleNotes('F')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
	});

	it('returns Bb major scale', () => {
		expect(getScaleNotes('Bb')).toEqual(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']);
	});

	it('returns Eb major scale', () => {
		expect(getScaleNotes('Eb')).toEqual(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']);
	});

	it('returns Ab major scale', () => {
		expect(getScaleNotes('Ab')).toEqual(['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']);
	});

	it('returns all 12 keys with 7 notes each', () => {
		for (const key of KEY_ORDER) {
			const notes = getScaleNotes(key);
			expect(notes).toHaveLength(7);
			expect(notes[0]).toBe(key);
		}
	});
});

describe('getDiatonicChords', () => {
	it('returns 7 chords for C major with correct qualities', () => {
		const chords = getDiatonicChords('C');
		expect(chords).toHaveLength(7);

		expect(chords[0].name).toBe('C maj');
		expect(chords[0].quality).toBe('major');
		expect(chords[0].roman).toBe('I');

		expect(chords[1].name).toBe('D min');
		expect(chords[1].quality).toBe('minor');
		expect(chords[1].roman).toBe('ii');

		expect(chords[2].name).toBe('E min');
		expect(chords[2].quality).toBe('minor');
		expect(chords[2].roman).toBe('iii');

		expect(chords[3].name).toBe('F maj');
		expect(chords[3].quality).toBe('major');
		expect(chords[3].roman).toBe('IV');

		expect(chords[4].name).toBe('G maj');
		expect(chords[4].quality).toBe('major');
		expect(chords[4].roman).toBe('V');

		expect(chords[5].name).toBe('A min');
		expect(chords[5].quality).toBe('minor');
		expect(chords[5].roman).toBe('vi');

		expect(chords[6].name).toBe('B dim');
		expect(chords[6].quality).toBe('diminished');
		expect(chords[6].roman).toBe('vii°');
	});

	it('returns correct chords for G major', () => {
		const chords = getDiatonicChords('G');
		const names = chords.map((c) => c.name);
		expect(names).toEqual([
			'G maj', 'A min', 'B min', 'C maj', 'D maj', 'E min', 'F# dim'
		]);
	});

	it('returns correct chords for F major (flat key)', () => {
		const chords = getDiatonicChords('F');
		const names = chords.map((c) => c.name);
		expect(names).toEqual([
			'F maj', 'G min', 'A min', 'Bb maj', 'C maj', 'D min', 'E dim'
		]);
	});

	it('each chord has 4-note voicing', () => {
		for (const key of KEY_ORDER) {
			const chords = getDiatonicChords(key);
			for (const chord of chords) {
				expect(chord.notes).toHaveLength(4);
				// Each note should end with an octave number
				for (const note of chord.notes) {
					expect(note).toMatch(/^[A-G][#b]?\d$/);
				}
			}
		}
	});

	it('degrees are 1–7', () => {
		const chords = getDiatonicChords('C');
		expect(chords.map((c) => c.degree)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});
});

describe('getChordByDegree', () => {
	it('returns the I chord for C major', () => {
		const chord = getChordByDegree('C', 1);
		expect(chord.name).toBe('C maj');
		expect(chord.quality).toBe('major');
	});

	it('returns the V chord for G major', () => {
		const chord = getChordByDegree('G', 5);
		expect(chord.name).toBe('D maj');
	});

	it('throws for invalid degree', () => {
		expect(() => getChordByDegree('C', 0)).toThrow();
		expect(() => getChordByDegree('C', 8)).toThrow();
	});
});

describe('getChordDegree', () => {
	it('returns correct degree for chord name', () => {
		expect(getChordDegree('C', 'C maj')).toBe(1);
		expect(getChordDegree('C', 'G maj')).toBe(5);
		expect(getChordDegree('C', 'B dim')).toBe(7);
	});

	it('throws for unknown chord', () => {
		expect(() => getChordDegree('C', 'X major')).toThrow();
	});
});

describe('getRomanNumeral', () => {
	it('returns uppercase for major chords', () => {
		expect(getRomanNumeral(1, 'major')).toBe('I');
		expect(getRomanNumeral(4, 'major')).toBe('IV');
		expect(getRomanNumeral(5, 'major')).toBe('V');
	});

	it('returns lowercase for minor chords', () => {
		expect(getRomanNumeral(2, 'minor')).toBe('ii');
		expect(getRomanNumeral(3, 'minor')).toBe('iii');
		expect(getRomanNumeral(6, 'minor')).toBe('vi');
	});

	it('returns lowercase with degree symbol for diminished', () => {
		expect(getRomanNumeral(7, 'diminished')).toBe('vii°');
	});
});

describe('voicings', () => {
	it('C major I chord is voiced correctly', () => {
		const chord = getChordByDegree('C', 1);
		expect(chord.notes).toEqual(['C4', 'E4', 'G4', 'C5']);
	});

	it('C major ii chord (D minor) is voiced correctly', () => {
		const chord = getChordByDegree('C', 2);
		expect(chord.notes).toEqual(['D4', 'F4', 'A4', 'D5']);
	});

	it('C major vii° chord (B dim) is voiced correctly', () => {
		const chord = getChordByDegree('C', 7);
		// B is high in chromatic range, so third (D) and fifth (F) land in octave 5
		expect(chord.notes).toEqual(['B4', 'D5', 'F5', 'B5']);
	});
});
