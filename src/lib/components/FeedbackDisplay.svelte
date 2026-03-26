<script lang="ts">
	type Props = {
		correct: boolean;
		correctAnswer: string;
		userAnswer: string;
	};

	let { correct, correctAnswer, userAnswer }: Props = $props();
</script>

<div class="feedback" class:correct class:incorrect={!correct}>
	<div class="feedback-icon">
		{#if correct}
			<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
				<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		{:else}
			<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
				<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
			</svg>
		{/if}
	</div>
	<div class="feedback-text">
		{#if correct}
			<div class="feedback-title">Great job!</div>
		{:else}
			<div class="feedback-title">Correct answer:</div>
			<div class="feedback-answer">{correctAnswer}</div>
		{/if}
	</div>
</div>

<style>
	.feedback {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px 24px;
		border-radius: 16px;
		width: 100%;
		animation: slideUp 0.25s ease-out;
	}
	.correct {
		background: color-mix(in srgb, var(--color-success) 15%, var(--color-bg));
	}
	.incorrect {
		background: color-mix(in srgb, var(--color-error) 12%, var(--color-bg));
	}
	.feedback-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.correct .feedback-icon {
		background: var(--color-success);
		color: var(--color-bg);
	}
	.incorrect .feedback-icon {
		background: var(--color-error);
		color: #fff;
	}
	.feedback-title {
		font-size: 20px;
		font-weight: 800;
	}
	.correct .feedback-title {
		color: var(--color-success);
	}
	.incorrect .feedback-title {
		color: var(--color-error);
	}
	.feedback-answer {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-error);
		margin-top: 2px;
	}
	@keyframes slideUp {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
