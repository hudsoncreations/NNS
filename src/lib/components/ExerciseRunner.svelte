<script lang="ts">
	import { goto } from '$app/navigation';
	import { getDiatonicChords, getChordByDegree, type Chord } from '$lib/theory/index.js';
	import { progress, sessionState, userPreferences } from '$lib/stores/index.svelte.js';
	import { getExerciseType, type ExerciseType } from '$lib/exercises/config.js';
	import MultipleChoice from './MultipleChoice.svelte';
	import TextInput from './TextInput.svelte';
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

	// Session state
	let questions = $state<Question[]>([]);
	let currentIndex = $state(0);
	let answers = $state<AnswerRecord[]>([]);
	let phase = $state<'question' | 'feedback' | 'summary'>('question');
	let lastCorrect = $state(false);
	let lastCorrectAnswer = $state('');
	let lastUserAnswer = $state('');
	let disabled = $state(false);

	type Question = {
		prompt: string;
		type: 'multipleChoice' | 'text' | 'dragDrop' | 'audio';
		options?: string[];
		slots?: string[];
		items?: string[];
		correctAnswer: string | string[];
		targetChord?: Chord;
		referenceChord?: Chord;
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

	function generateQuestions() {
		if (!exerciseType) return;

		currentIndex = 0;
		answers = [];
		phase = 'question';

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
				const options = chords.map((c) => c.roman);
				return {
					prompt: `What scale degree is ${chord.name}?`,
					type: difficulty === 'beginner' ? 'multipleChoice' as const : 'text' as const,
					options,
					correctAnswer: chord.roman
				};
			});
		} else if (exerciseId === 'identifyChord') {
			const degrees = randomDegrees(exerciseType.questionsPerSession);
			questions = degrees.map((deg) => {
				const chord = getChordByDegree(exerciseKey, deg);
				const options = chords.map((c) => c.name);
				return {
					prompt: `What chord is the ${chord.roman}?`,
					type: difficulty === 'beginner' ? 'multipleChoice' as const : 'text' as const,
					options,
					correctAnswer: chord.name
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
	}

	function handleAnswer(answer: string | string[]) {
		if (disabled) return;
		disabled = true;

		const q = questions[currentIndex];
		let correct: boolean;
		let userStr: string;
		let correctStr: string;

		if (Array.isArray(answer) && Array.isArray(q.correctAnswer)) {
			// Chord spelling — count correct placements
			let correctCount = 0;
			for (let i = 0; i < answer.length; i++) {
				if (answer[i] === q.correctAnswer[i]) correctCount++;
			}
			correct = correctCount >= 6; // 6/7 = ~86%
			userStr = `${correctCount}/7 correct`;
			correctStr = q.correctAnswer.join(', ');
		} else {
			const ansStr = typeof answer === 'string' ? answer : answer.join(', ');
			const correctAns = typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.join(', ');
			correct = ansStr.toLowerCase().trim() === correctAns.toLowerCase().trim();
			userStr = ansStr;
			correctStr = correctAns;
		}

		lastCorrect = correct;
		lastUserAnswer = userStr;
		lastCorrectAnswer = correctStr;
		answers = [...answers, { question: q.prompt, answer: userStr, correct, correctAnswer: correctStr }];
		phase = 'feedback';

		// Auto-advance after feedback
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
		goto(`/key/${encodeURIComponent(exerciseKey)}`);
	}

	const currentQuestion = $derived(questions[currentIndex]);
	const progressPercent = $derived(
		questions.length > 0 ? (currentIndex / questions.length) * 100 : 0
	);
	const scoreData = $derived({
		correct: answers.filter((a) => a.correct).length,
		total: answers.length
	});
	const passed = $derived(
		exerciseType ? (scoreData.total > 0 ? scoreData.correct / scoreData.total >= exerciseType.passThreshold : false) : false
	);
</script>

{#if exerciseType && currentQuestion && phase !== 'summary'}
	<div class="exercise">
		<!-- Progress bar -->
		<div class="progress-bar-wrap">
			<div class="progress-bar" style="width: {progressPercent}%"></div>
		</div>
		<div class="progress-label">{currentIndex + 1} / {questions.length}</div>

		<!-- Question phase -->
		{#if phase === 'question'}
			<div class="prompt">
				{#if exerciseId === 'audioId' && currentQuestion.referenceChord && currentQuestion.targetChord}
					<p class="key-label">Key of {exerciseKey} Major</p>
					<p class="prompt-text">Listen: you'll hear the I chord, then a mystery chord.</p>
					<p class="prompt-sub">{currentQuestion.prompt}</p>

					<AudioPlayer
						referenceNotes={currentQuestion.referenceChord.notes}
						targetNotes={currentQuestion.targetChord.notes}
						speed={userPreferences.value.playbackSpeed}
					/>
				{:else}
					<p class="key-label">Key of {exerciseKey} Major</p>
					<p class="prompt-text">{currentQuestion.prompt}</p>
				{/if}
			</div>

			<div class="input-area">
				{#if currentQuestion.type === 'dragDrop' && currentQuestion.slots && currentQuestion.items}
					<DragDrop
						slots={currentQuestion.slots}
						items={currentQuestion.items}
						onAnswer={handleAnswer}
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

		<!-- Feedback phase -->
		{#if phase === 'feedback'}
			<div class="prompt">
				<p class="key-label">Key of {exerciseKey} Major</p>
				<p class="prompt-text">{currentQuestion.prompt}</p>
			</div>
			<FeedbackDisplay
				correct={lastCorrect}
				correctAnswer={lastCorrectAnswer}
				userAnswer={lastUserAnswer}
			/>
		{/if}
	</div>
{/if}

{#if phase === 'summary'}
	<SessionSummary
		score={scoreData}
		{passed}
		{answers}
		onRetry={retry}
		onBack={goBack}
	/>
{/if}

<style>
	.exercise {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.progress-bar-wrap {
		height: 4px;
		background: var(--color-bg-card);
		border-radius: 4px;
		overflow: hidden;
	}
	.progress-bar {
		height: 100%;
		background: var(--color-primary);
		border-radius: 4px;
		transition: width 0.3s ease;
	}
	.progress-label {
		font-size: 13px;
		color: var(--color-text-muted);
		text-align: right;
	}
	.prompt {
		text-align: center;
	}
	.key-label {
		font-size: 13px;
		color: var(--color-text-muted);
		margin-bottom: 8px;
	}
	.prompt-text {
		font-size: 18px;
		font-weight: 600;
		line-height: 1.4;
	}
	.prompt-sub {
		font-size: 15px;
		margin-top: 4px;
		color: var(--color-text-muted);
	}
	.input-area {
		margin-top: 8px;
	}
</style>
