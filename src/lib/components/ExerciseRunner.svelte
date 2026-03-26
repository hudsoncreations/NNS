<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { getDiatonicChords, getChordByDegree, getRomanNumeral, type Chord } from '$lib/theory/index.js';
	import { progress, sessionState, userPreferences } from '$lib/stores/index.svelte.js';
	import { getExerciseType, type ExerciseType } from '$lib/exercises/config.js';
	import MultipleChoice from './MultipleChoice.svelte';
	import TextInput from './TextInput.svelte';
	import NumberPad from './NumberPad.svelte';
	import DragDrop from './DragDrop.svelte';
	import AudioPlayer from './AudioPlayer.svelte';
	import FeedbackDisplay from './FeedbackDisplay.svelte';
	import SessionSummary from './SessionSummary.svelte';

	type Props = {
		exerciseKey: string;
		exerciseId: string;
	};

	let { exerciseKey, exerciseId }: Props = $props();

	const exerciseType = $derived(getExerciseType(exerciseId));
	const chords = $derived(getDiatonicChords(exerciseKey));
	const difficulty = $derived(userPreferences.value.difficulty);
	const timerEnabled = $derived(userPreferences.value.timerEnabled);
	const timerDuration = $derived(userPreferences.value.timerDuration);

	// Session state
	let questions = $state<Question[]>([]);
	let currentIndex = $state(0);
	let answers = $state<AnswerRecord[]>([]);
	let phase = $state<'question' | 'feedback' | 'summary'>('question');
	let lastCorrect = $state(false);
	let lastCorrectAnswer = $state('');
	let lastUserAnswer = $state('');
	let disabled = $state(false);

	// Timer state
	let timerRemaining = $state(0);
	let timerTotal = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	const timerActive = $derived(timerEnabled && timerTotal > 0);

	type Question = {
		prompt: string;
		type: 'multipleChoice' | 'text' | 'dragDrop' | 'audio' | 'numberPad';
		options?: string[];
		slots?: string[];
		items?: string[];
		correctAnswer: string | string[];
		targetChord?: Chord;
		referenceChord?: Chord;
		displayTarget?: string;
		showChordLabels?: boolean;
	};

	type AnswerRecord = {
		question: string;
		answer: string;
		correct: boolean;
		correctAnswer?: string;
	};

	$effect(() => {
		if (exerciseType) {
			generateQuestions();
		}
	});

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function randomDegrees(count: number, total: number = 7): number[] {
		const all = Array.from({ length: total }, (_, i) => i + 1);
		return shuffle(all).slice(0, count);
	}

	const DIATONIC_QUALITIES: Array<'major' | 'minor' | 'minor' | 'major' | 'major' | 'minor' | 'diminished'> =
		['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];

	function normalizeAnswer(input: string): string {
		let s = input.trim().toLowerCase();

		// Plain number → roman numeral (e.g. "3" → "iii")
		const num = parseInt(s, 10);
		if (num >= 1 && num <= 7 && s === String(num)) {
			return getRomanNumeral(num, DIATONIC_QUALITIES[num - 1]).toLowerCase();
		}

		// Normalize degree symbol variants
		s = s.replace(/°/g, '°');

		// Normalize chord name variants:
		// "em" "emin" "e minor" "e min" "e-" → "e min"
		// "cmaj" "c major" "c maj" "cM" → "c maj"
		// "bdim" "b diminished" "b dim" "b°" → "b dim"
		s = s
			.replace(/\bdiminished\b/g, 'dim')
			.replace(/\bminor\b/g, 'min')
			.replace(/\bmajor\b/g, 'maj');

		// Handle shorthand with no space: "em" → "e min", "cmaj" → "c maj", "f#dim" → "f# dim"
		// Match note (letter + optional # or b) followed directly by quality keyword
		s = s.replace(/^([a-g][#b]?)(min|maj|dim|m)$/i, (_, note, qual) => {
			if (qual === 'm') qual = 'min';
			return `${note} ${qual}`;
		});

		// Bare note name with no quality → assume major (e.g. "c" → "c maj", "f#" → "f# maj")
		if (/^[a-g][#b]?$/.test(s)) {
			s = `${s} maj`;
		}

		return s;
	}

	function startTimer() {
		stopTimer();
		const enabled = userPreferences.value.timerEnabled;
		const duration = userPreferences.value.timerDuration;
		if (!enabled || !duration) return;
		timerTotal = duration;
		timerRemaining = duration;
		timerInterval = setInterval(() => {
			timerRemaining = Math.max(0, timerRemaining - 0.1);
			if (timerRemaining <= 0) {
				stopTimer();
				timerExpired();
			}
		}, 100);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function timerExpired() {
		disabled = true;
		phase = 'summary';
		if (!exerciseType) return;
		const correctCount = answers.filter((a) => a.correct).length;
		const total = questions.length;
		const score = total > 0 ? correctCount / total : 0;
		progress.recordExerciseResult(exerciseKey, exerciseId, score, false);
	}

	function generateQuestions() {
		if (!exerciseType) return;

		currentIndex = 0;
		answers = [];
		phase = 'question';
		stopTimer();

		if (exerciseId === 'chordSpelling') {
			const romanNumerals = chords.map((c) => c.roman);
			const shuffledNames = shuffle(chords.map((c) => c.name));
			questions = [{
				prompt: 'Drag each chord to its correct scale degree',
				type: 'dragDrop',
				slots: romanNumerals,
				items: shuffledNames,
				correctAnswer: chords.map((c) => c.name)
			}];
		} else if (exerciseId === 'identifyNumber') {
			const degrees = randomDegrees(exerciseType.questionsPerSession);
			questions = degrees.map((deg) => {
				const chord = getChordByDegree(exerciseKey, deg);
				return {
					prompt: 'What chord is this?',
					type: 'text' as const,
					displayTarget: chord.roman,
					correctAnswer: chord.name
				};
			});
		} else if (exerciseId === 'identifyChord') {
			const degrees = randomDegrees(exerciseType.questionsPerSession);
			questions = degrees.map((deg) => {
				const chord = getChordByDegree(exerciseKey, deg);
				return {
					prompt: 'What number is this chord?',
					type: 'numberPad' as const,
					displayTarget: chord.name,
					correctAnswer: chord.roman,
				};
			});
		} else if (exerciseId === 'audioId') {
			const degrees = randomDegrees(exerciseType.questionsPerSession);
			questions = degrees.map((deg) => {
				const chord = getChordByDegree(exerciseKey, deg);
				const refChord = getChordByDegree(exerciseKey, 1);
				const options = chords.map((c) => c.roman);
				return {
					prompt: 'What number is the mystery chord?',
					type: difficulty === 'beginner' ? 'multipleChoice' as const : 'text' as const,
					options,
					correctAnswer: chord.roman,
					targetChord: chord,
					referenceChord: refChord
				};
			});
		}

		startTimer();
	}

	function handleAnswer(answer: string | string[]) {
		if (disabled) return;
		disabled = true;

		const q = questions[currentIndex];
		let correct: boolean;
		let userStr: string;
		let correctStr: string;

		if (Array.isArray(answer) && Array.isArray(q.correctAnswer)) {
			let correctCount = 0;
			for (let i = 0; i < answer.length; i++) {
				if (answer[i] === q.correctAnswer[i]) correctCount++;
			}
			correct = correctCount >= 6;
			userStr = `${correctCount}/7 correct`;
			correctStr = q.correctAnswer.join(', ');
		} else {
			const ansStr = typeof answer === 'string' ? answer : answer.join(', ');
			const correctAns = typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.join(', ');
			correct = normalizeAnswer(ansStr) === normalizeAnswer(correctAns);
			userStr = ansStr;
			correctStr = correctAns;
		}

		lastCorrect = correct;
		lastUserAnswer = userStr;
		lastCorrectAnswer = correctStr;
		answers = [...answers, { question: q.prompt, answer: userStr, correct, correctAnswer: correctStr }];
		phase = 'feedback';

		setTimeout(() => {
			disabled = false;
			if (currentIndex < questions.length - 1) {
				currentIndex++;
				phase = 'question';
			} else {
				finishSession();
			}
		}, 1500);
	}

	function finishSession() {
		stopTimer();
		phase = 'summary';
		if (!exerciseType) return;

		const correctCount = answers.filter((a) => a.correct).length;
		const total = answers.length;
		const score = total > 0 ? correctCount / total : 0;
		const passed = score >= exerciseType.passThreshold;

		progress.recordExerciseResult(exerciseKey, exerciseId, score, passed);
	}

	function retry() {
		generateQuestions();
	}

	function goBack() {
		goto(`${base}/key/${encodeURIComponent(exerciseKey)}`);
	}

	function closeExercise() {
		goto(`${base}/key/${encodeURIComponent(exerciseKey)}`);
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;
		// Don't intercept Enter when typing in a text input (TextInput handles its own Enter)
		if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

		if (phase === 'summary') {
			e.preventDefault();
			if (passed) {
				goBack();
			} else {
				retry();
			}
		}
	}

	const currentQuestion = $derived(questions[currentIndex]);
	const progressPercent = $derived(
		questions.length > 0 ? ((currentIndex + (phase === 'feedback' ? 1 : 0)) / questions.length) * 100 : 0
	);
	const scoreData = $derived({
		correct: answers.filter((a) => a.correct).length,
		total: answers.length
	});
	const passed = $derived(
		exerciseType ? (scoreData.total > 0 ? scoreData.correct / scoreData.total >= exerciseType.passThreshold : false) : false
	);
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#if exerciseType && currentQuestion && phase !== 'summary'}
	<div class="exercise-screen">
		<!-- Top bar: close, progress, counter -->
		<div class="top-bar">
			<button class="close-btn" onclick={closeExercise} aria-label="Close exercise">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
				</svg>
			</button>
			<div class="progress-track">
				<div class="progress-fill" style="width: {progressPercent}%"></div>
			</div>
			<div class="counter">{currentIndex + 1}/{questions.length}</div>
		</div>

		{#if timerActive}
			<div class="timer-bar-wrap">
				<div
					class="timer-bar"
					class:warning={timerRemaining > 0 && timerRemaining / timerTotal <= 0.25}
					class:danger={timerRemaining > 0 && timerRemaining / timerTotal <= 0.10}
					style="width: {(timerRemaining / timerTotal) * 100}%"
				></div>
			</div>
		{/if}

		<!-- Center content -->
		<div class="center-content">
			{#if phase === 'question'}
				{#if exerciseId === 'audioId' && currentQuestion.referenceChord && currentQuestion.targetChord}
					<h2 class="prompt-heading">Listen and identify</h2>
					<p class="prompt-sub">You'll hear the I chord, then a mystery chord. {currentQuestion.prompt}</p>

					<AudioPlayer
						referenceNotes={currentQuestion.referenceChord.notes}
						targetNotes={currentQuestion.targetChord.notes}
						speed={userPreferences.value.playbackSpeed}
					/>
				{:else if currentQuestion.displayTarget}
					<p class="key-badge">{exerciseKey} Major</p>
					<p class="prompt-sub">{currentQuestion.prompt}</p>
					<div class="display-target">{currentQuestion.displayTarget}</div>
				{:else if currentQuestion.type === 'dragDrop'}
					<h2 class="prompt-heading">{currentQuestion.prompt}</h2>
					<p class="key-badge">{exerciseKey} Major</p>
				{:else}
					<p class="key-badge">{exerciseKey} Major</p>
					<h2 class="prompt-heading">{currentQuestion.prompt}</h2>
				{/if}

				<div class="input-area">
					{#if currentQuestion.type === 'dragDrop' && currentQuestion.slots && currentQuestion.items}
						<DragDrop
							slots={currentQuestion.slots}
							items={currentQuestion.items}
							onAnswer={handleAnswer}
							{disabled}
						/>
					{:else if currentQuestion.type === 'numberPad'}
						<NumberPad
							onAnswer={(a) => handleAnswer(a)}
							{chords}
							{disabled}
						/>
					{:else if currentQuestion.type === 'multipleChoice' && currentQuestion.options}
						<MultipleChoice
							options={currentQuestion.options}
							onAnswer={(a) => handleAnswer(a)}
							{disabled}
						/>
					{:else if currentQuestion.type === 'text'}
						<TextInput
							onAnswer={(a) => handleAnswer(a)}
							{disabled}
						/>
					{/if}
				</div>
			{/if}

			{#if phase === 'feedback'}
				<h2 class="prompt-heading">{currentQuestion.prompt}</h2>
				<FeedbackDisplay
					correct={lastCorrect}
					correctAnswer={lastCorrectAnswer}
					userAnswer={lastUserAnswer}
				/>
			{/if}
		</div>
	</div>
{/if}

{#if phase === 'summary'}
	<div class="exercise-screen">
		<div class="top-bar">
			<button class="close-btn" onclick={goBack} aria-label="Close">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
				</svg>
			</button>
			<div class="progress-track">
				<div class="progress-fill" style="width: 100%"></div>
			</div>
			<div class="counter"></div>
		</div>
		<div class="center-content">
			<SessionSummary
				score={scoreData}
				{passed}
				{answers}
				onRetry={retry}
				onBack={goBack}
			/>
		</div>
	</div>
{/if}

<style>
	.exercise-screen {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding: 20px 24px;
	}

	.top-bar {
		display: flex;
		align-items: center;
		gap: 16px;
		max-width: 700px;
		width: 100%;
		margin: 0 auto 32px;
	}

	.close-btn {
		color: var(--color-text-muted);
		padding: 4px;
		border-radius: 8px;
		display: flex;
		transition: color 0.15s;
		flex-shrink: 0;
	}
	.close-btn:hover {
		color: var(--color-text);
	}

	.timer-bar-wrap {
		max-width: 700px;
		width: 100%;
		margin: -16px auto 0;
		height: 10px;
		background: var(--color-bg-elevated);
		border-radius: 6px;
		overflow: hidden;
	}
	.timer-bar {
		height: 100%;
		background: var(--color-success);
		border-radius: 6px;
		transition: width 0.1s linear;
	}
	.timer-bar.warning {
		background: var(--color-warning);
	}
	.timer-bar.danger {
		background: var(--color-error);
	}

	.progress-track {
		flex: 1;
		height: 16px;
		background: var(--color-bg-elevated);
		border-radius: 10px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: var(--color-success);
		border-radius: 10px;
		transition: width 0.4s ease;
	}

	.counter {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-text-muted);
		min-width: 36px;
		text-align: right;
	}

	.center-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 600px;
		width: 100%;
		margin: 0 auto;
		gap: 12px;
	}

	.key-badge {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.prompt-heading {
		font-size: 28px;
		font-weight: 800;
		text-align: center;
		line-height: 1.3;
	}

	.prompt-sub {
		font-size: 16px;
		color: var(--color-text-muted);
		text-align: center;
	}

	.display-target {
		font-size: 80px;
		font-weight: 800;
		text-align: center;
		line-height: 1;
		color: var(--color-text);
		padding: 16px 0;
	}

	.input-area {
		width: 100%;
		margin-top: 24px;
		display: flex;
		justify-content: center;
	}
</style>
