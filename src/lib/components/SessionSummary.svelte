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
	<!-- Big score display -->
	<div class="score-hero" class:passed class:failed={!passed}>
		{#if passed}
			<div class="hero-icon">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
					<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<h2 class="hero-title">Lesson Complete!</h2>
		{:else}
			<h2 class="hero-title">Almost there!</h2>
		{/if}
		<div class="score-big">{score.correct} / {score.total}</div>
		<div class="score-pct">{percentage}% correct</div>
	</div>

	<!-- Wrong answers review -->
	{#if answers.some((a) => !a.correct)}
		<div class="review">
			<h3 class="review-title">Review mistakes</h3>
			{#each answers.filter((a) => !a.correct) as answer}
				<div class="review-item">
					<div class="review-q">{answer.question}</div>
					<div class="review-answers">
						<span class="your-answer">{answer.answer}</span>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
							<path d="M5 12h14m-7-7l7 7-7 7" stroke="var(--color-text-subtle)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span class="correct-answer">{answer.correctAnswer ?? '?'}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Actions -->
	<div class="actions">
		{#if passed}
			<button class="btn-3d success action-btn" onclick={onBack}>Continue</button>
		{:else}
			<button class="btn-3d primary action-btn" onclick={onRetry}>Try Again</button>
			<button class="btn-3d ghost action-btn" onclick={onBack}>Back to Key</button>
		{/if}
	</div>
</div>

<style>
	.summary {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		width: 100%;
		animation: fadeIn 0.3s ease;
	}

	.score-hero {
		text-align: center;
		padding: 32px;
		border-radius: 20px;
		width: 100%;
	}
	.passed {
		background: color-mix(in srgb, var(--color-success) 12%, var(--color-bg));
	}
	.failed {
		background: color-mix(in srgb, var(--color-warning) 10%, var(--color-bg));
	}

	.hero-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: var(--color-success);
		color: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
	}

	.hero-title {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 8px;
	}
	.passed .hero-title { color: var(--color-success); }
	.failed .hero-title { color: var(--color-warning); }

	.score-big {
		font-size: 48px;
		font-weight: 900;
		color: var(--color-text);
	}
	.score-pct {
		font-size: 16px;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.review {
		width: 100%;
	}
	.review-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text-muted);
		margin-bottom: 12px;
	}
	.review-item {
		padding: 14px 16px;
		background: var(--color-bg-card);
		border-radius: 12px;
		margin-bottom: 8px;
		border: 2px solid var(--color-border);
	}
	.review-q {
		font-size: 14px;
		color: var(--color-text-muted);
		margin-bottom: 6px;
	}
	.review-answers {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 15px;
		font-weight: 600;
	}
	.your-answer {
		color: var(--color-error);
		text-decoration: line-through;
	}
	.correct-answer {
		color: var(--color-success);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
	}
	.action-btn {
		width: 100%;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
