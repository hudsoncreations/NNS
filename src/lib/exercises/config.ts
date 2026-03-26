/**
 * Exercise type configurations.
 * Each exercise defines its metadata; the actual question generation
 * and validation lives in the ExerciseRunner component.
 */

export type ExerciseType = {
	id: string;
	name: string;
	description: string;
	hasAudio: boolean;
	questionsPerSession: number;
	passThreshold: number;
};

export const EXERCISE_TYPES: ExerciseType[] = [
	{
		id: 'chordSpelling',
		name: 'Chord Spelling',
		description: 'Drag each chord to its correct scale degree',
		hasAudio: false,
		questionsPerSession: 1,
		passThreshold: 6 / 7 // ~86%, 6 of 7 slots correct
	},
	{
		id: 'identifyNumber',
		name: 'Identify the Number',
		description: 'What scale degree is this chord?',
		hasAudio: false,
		questionsPerSession: 5,
		passThreshold: 0.8
	},
	{
		id: 'identifyChord',
		name: 'Identify the Chord',
		description: 'What chord is this scale degree?',
		hasAudio: false,
		questionsPerSession: 5,
		passThreshold: 0.8
	},
	{
		id: 'audioId',
		name: 'Audio Identification',
		description: 'Listen and identify the chord number',
		hasAudio: true,
		questionsPerSession: 5,
		passThreshold: 0.8
	}
];

export function getExerciseType(id: string): ExerciseType | undefined {
	return EXERCISE_TYPES.find((e) => e.id === id);
}
