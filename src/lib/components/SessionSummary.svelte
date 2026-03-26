<script lang="ts">
	type AnswerRecord = {
		question: string;
		answer: string;
		correct: boolean;
		correctAnswer?: string;
	};

	type Props = {
		score: { correct: number; total: number };
		passed: boolean;
		answers: AnswerRecord[];
		onRetry: () => void;
		onBack: () => void;
	};

	let { score, passed, answers, onRetry, onBack }: Props = $props();

	const percentage = $derived(
		score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
	);
</script>

<div class="summary">
	<div class="score-display" class:passed class:failed={!passed}>
		<div class="score-number">{score.correct}/{score.total}</div>
		<div class="score-percent">{percentage}%</div>
		<div class="score-label">{passed ? 'Passed!' : 'Not quite...'}</div>
	</div>

	{#if answers.some((a) => !a.correct)}
		<div class="wrong-answers">
			<h3>Review</h3>
			{#each answers.filter((a) => !a.correct) as answer}
				<div class="wrong-item">
					<span class="wrong-q">{answer.question}</span>
					<span class="wrong-yours">{answer.answer}</span>
					<span class="wrong-arrow">&rarr;</span>
					<span class="wrong-correct">{answer.correctAnswer ?? '?'}</span>
				</div>
			{/each}
		</div>
	{/if}

	<div class="actions">
		<button class="btn primary" onclick={onRetry}>Try Again</button>
		<button class="btn secondary" onclick={onBack}>Back to Key</button>
	</div>
</div>

<style>
	.summary {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding-top: 16px;
	}
	.score-display {
		text-align: center;
		padding: 24px;
		border-radius: 16px;
		width: 100%;
	}
	.passed {
		background: color-mix(in srgb, var(--color-success) 15%, var(--color-bg-card));
	}
	.failed {
		background: color-mix(in srgb, var(--color-error) 10%, var(--color-bg-card));
	}
	.score-number {
		font-size: 40px;
		font-weight: 800;
	}
	.passed .score-number { color: var(--color-success); }
	.failed .score-number { color: var(--color-error); }
	.score-percent {
		font-size: 18px;
		color: var(--color-text-muted);
		margin-top: 4px;
	}
	.score-label {
		font-size: 16px;
		font-weight: 600;
		margin-top: 8px;
	}
	.passed .score-label { color: var(--color-success); }
	.failed .score-label { color: var(--color-error); }

	.wrong-answers {
		width: 100%;
	}
	.wrong-answers h3 {
		font-size: 14px;
		color: var(--color-text-muted);
		margin-bottom: 8px;
	}
	.wrong-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: var(--color-bg-card);
		border-radius: 8px;
		margin-bottom: 6px;
		font-size: 13px;
	}
	.wrong-q {
		color: var(--color-text-muted);
		flex: 1;
	}
	.wrong-yours {
		color: var(--color-error);
		text-decoration: line-through;
	}
	.wrong-arrow {
		color: var(--color-text-subtle);
	}
	.wrong-correct {
		color: var(--color-success);
		font-weight: 600;
	}
	.actions {
		display: flex;
		gap: 12px;
		width: 100%;
	}
	.btn {
		flex: 1;
		padding: 14px;
		border-radius: 10px;
		font-size: 15px;
		font-weight: 600;
		transition: opacity 0.15s;
	}
	.btn.primary {
		background: var(--color-primary);
		color: var(--color-bg);
	}
	.btn.secondary {
		background: var(--color-bg-card);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}
</style>
