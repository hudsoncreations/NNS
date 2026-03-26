/**
 * Audio Engine
 *
 * Wraps Tone.js with a clean API for chord playback.
 * Single shared PolySynth instance, initialized on first user interaction.
 */

import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let initialized = false;
let _volume = 0.8;
let _playbackSpeed = 1;
let _playing = false;

async function ensureInitialized(): Promise<void> {
	if (!initialized) {
		await Tone.start();
		initialized = true;
	}
	if (!synth) {
		synth = new Tone.PolySynth(Tone.Synth, {
			envelope: {
				attack: 0.01,
				decay: 0.2,
				sustain: 0.6,
				release: 0.5
			},
			oscillator: {
				type: 'triangle'
			}
		});
		synth.volume.value = volumeToDb(_volume);
		synth.toDestination();
	}
}

function volumeToDb(level: number): number {
	if (level <= 0) return -Infinity;
	// Map 0-1 to -40db to 0db
	return -40 * (1 - level);
}

/** Play a single chord (array of note names like ["C4", "E4", "G4"]). */
export async function playChord(notes: string[], duration = 1): Promise<void> {
	await ensureInitialized();
	if (!synth) return;

	_playing = true;
	const adjustedDuration = duration / _playbackSpeed;

	synth.triggerAttackRelease(notes, adjustedDuration);

	await new Promise((resolve) => setTimeout(resolve, adjustedDuration * 1000));
	_playing = false;
}

/** Play a sequence of chords with pauses between them. */
export async function playProgression(
	chords: string[][],
	tempo = 1
): Promise<void> {
	await ensureInitialized();
	_playing = true;

	for (let i = 0; i < chords.length; i++) {
		await playChord(chords[i], tempo);
		if (i < chords.length - 1) {
			await new Promise((resolve) =>
				setTimeout(resolve, (300 / _playbackSpeed))
			);
		}
	}
	_playing = false;
}

/** Play reference I chord, pause, then target chord. */
export async function playReferenceAndTarget(
	referenceNotes: string[],
	targetNotes: string[]
): Promise<void> {
	await ensureInitialized();
	_playing = true;

	await playChord(referenceNotes, 1);
	await new Promise((resolve) => setTimeout(resolve, 500 / _playbackSpeed));
	await playChord(targetNotes, 1);

	_playing = false;
}

/** Set volume level (0 to 1). */
export function setVolume(level: number): void {
	_volume = Math.max(0, Math.min(1, level));
	if (synth) {
		synth.volume.value = volumeToDb(_volume);
	}
}

/** Get current volume level. */
export function getVolume(): number {
	return _volume;
}

/** Set playback speed multiplier. */
export function setPlaybackSpeed(rate: number): void {
	_playbackSpeed = rate;
}

/** Get current playback speed. */
export function getPlaybackSpeed(): number {
	return _playbackSpeed;
}

/** Check if audio is currently playing. */
export function isPlaying(): boolean {
	return _playing;
}

/** Dispose synth and reset state (for cleanup). */
export function dispose(): void {
	if (synth) {
		synth.dispose();
		synth = null;
	}
	initialized = false;
	_playing = false;
}
