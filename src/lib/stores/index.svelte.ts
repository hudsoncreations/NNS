/**
 * State Stores
 *
 * Three Svelte 5 stores: userPreferences (persisted), progress (persisted),
 * sessionState (not persisted). Uses localStorage with debounced writes.
 */

import { KEY_ORDER } from '$lib/theory/index.js';

// --- Types ---

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ThemeMode = 'system' | 'light' | 'dark';
export type KeyStatus = 'locked' | 'in_progress' | 'completed';

export type UserPreferences = {
	volume: number;
	playbackSpeed: number;
	difficulty: Difficulty;
	theme: ThemeMode;
};

export type ExerciseProgress = {
	attempts: number;
	correct: number;
	completed: boolean;
	bestScore: number;
};

export type KeyProgress = {
	status: KeyStatus;
	exercises: Record<string, ExerciseProgress>;
};

export type Progress = {
	keys: Record<string, KeyProgress>;
};

export type SessionState = {
	currentKey: string | null;
	currentExercise: string | null;
	questionIndex: number;
	answers: Array<{ question: string; answer: string; correct: boolean }>;
	score: { correct: number; total: number };
};

// --- Defaults ---

const DEFAULT_PREFERENCES: UserPreferences = {
	volume: 0.8,
	playbackSpeed: 1,
	difficulty: 'beginner',
	theme: 'system'
};

function createDefaultProgress(): Progress {
	const keys: Record<string, KeyProgress> = {};
	for (let i = 0; i < KEY_ORDER.length; i++) {
		keys[KEY_ORDER[i]] = {
			status: i === 0 ? 'in_progress' : 'locked',
			exercises: {}
		};
	}
	return { keys };
}

const DEFAULT_SESSION: SessionState = {
	currentKey: null,
	currentExercise: null,
	questionIndex: 0,
	answers: [],
	score: { correct: 0, total: 0 }
};

// --- Persisted store helper ---

function loadFromStorage<T>(key: string, defaults: T): T {
	if (typeof window === 'undefined') return defaults;
	try {
		const stored = localStorage.getItem(key);
		if (!stored) return defaults;
		const parsed = JSON.parse(stored);
		// Merge with defaults so new fields get filled in
		return { ...defaults, ...parsed };
	} catch {
		return defaults;
	}
}

let saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function saveToStorage<T>(key: string, value: T): void {
	if (typeof window === 'undefined') return;
	clearTimeout(saveTimers[key]);
	saveTimers[key] = setTimeout(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, 300);
}

// --- Reactive stores using Svelte 5 $state ---

function createPreferencesStore() {
	let state = $state<UserPreferences>(DEFAULT_PREFERENCES);

	return {
		get value() { return state; },
		init() {
			state = loadFromStorage('nns-preferences', DEFAULT_PREFERENCES);
		},
		update(partial: Partial<UserPreferences>) {
			state = { ...state, ...partial };
			saveToStorage('nns-preferences', state);
		},
		reset() {
			state = { ...DEFAULT_PREFERENCES };
			saveToStorage('nns-preferences', state);
		}
	};
}

function createProgressStore() {
	let state = $state<Progress>(createDefaultProgress());

	return {
		get value() { return state; },
		init() {
			state = loadFromStorage('nns-progress', createDefaultProgress());
		},
		getKeyProgress(key: string): KeyProgress {
			return state.keys[key] ?? { status: 'locked', exercises: {} };
		},
		getExerciseProgress(key: string, exerciseId: string): ExerciseProgress {
			return state.keys[key]?.exercises[exerciseId] ?? {
				attempts: 0, correct: 0, completed: false, bestScore: 0
			};
		},
		recordExerciseResult(key: string, exerciseId: string, score: number, passed: boolean) {
			const keyProgress = state.keys[key];
			if (!keyProgress) return;

			const prev = keyProgress.exercises[exerciseId] ?? {
				attempts: 0, correct: 0, completed: false, bestScore: 0
			};

			keyProgress.exercises[exerciseId] = {
				attempts: prev.attempts + 1,
				correct: prev.correct + (passed ? 1 : 0),
				completed: prev.completed || passed,
				bestScore: Math.max(prev.bestScore, score)
			};

			// Check if key is fully completed
			const exerciseTypes = ['chordSpelling', 'identifyNumber', 'identifyChord', 'audioId'];
			const allDone = exerciseTypes.every(
				(ex) => keyProgress.exercises[ex]?.completed
			);

			if (allDone && keyProgress.status !== 'completed') {
				keyProgress.status = 'completed';
				// Unlock next key
				const keyIdx = KEY_ORDER.indexOf(key);
				if (keyIdx >= 0 && keyIdx < KEY_ORDER.length - 1) {
					const nextKey = KEY_ORDER[keyIdx + 1];
					if (state.keys[nextKey]?.status === 'locked') {
						state.keys[nextKey].status = 'in_progress';
					}
				}
			}

			state = { ...state };
			saveToStorage('nns-progress', state);
		},
		reset() {
			state = createDefaultProgress();
			saveToStorage('nns-progress', state);
		}
	};
}

function createSessionStore() {
	let state = $state<SessionState>({ ...DEFAULT_SESSION });

	return {
		get value() { return state; },
		startSession(key: string, exercise: string) {
			state = {
				currentKey: key,
				currentExercise: exercise,
				questionIndex: 0,
				answers: [],
				score: { correct: 0, total: 0 }
			};
		},
		recordAnswer(question: string, answer: string, correct: boolean) {
			state.answers = [...state.answers, { question, answer, correct }];
			state.score = {
				correct: state.score.correct + (correct ? 1 : 0),
				total: state.score.total + 1
			};
			state.questionIndex = state.questionIndex + 1;
		},
		reset() {
			state = { ...DEFAULT_SESSION };
		}
	};
}

// --- Singleton exports ---

export const userPreferences = createPreferencesStore();
export const progress = createProgressStore();
export const sessionState = createSessionStore();
