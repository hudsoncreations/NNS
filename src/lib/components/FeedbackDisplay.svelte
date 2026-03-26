<script lang="ts">
	type Props = {
		correct: boolean;
		correctAnswer: string;
		userAnswer: string;
	};

	let { correct, correctAnswer, userAnswer }: Props = $props();
</script>

<div class="feedback" class:correct class:incorrect={!correct}>
	{#if correct}
		<div class="icon">&#10003;</div>
		<div class="message">Correct!</div>
	{:else}
		<div class="icon">&#10007;</div>
		<div class="message">
			<span class="wrong">"{userAnswer}"</span> — the answer is <strong>{correctAnswer}</strong>
		</div>
	{/if}
</div>

<style>
	.feedback {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 10px;
		animation: slideIn 0.2s ease-out;
	}
	.correct {
		background: color-mix(in srgb, var(--color-success) 15%, var(--color-bg-card));
		color: var(--color-success);
	}
	.incorrect {
		background: color-mix(in srgb, var(--color-error) 15%, var(--color-bg-card));
		color: var(--color-error);
	}
	.icon {
		font-size: 20px;
		font-weight: 700;
	}
	.message {
		font-size: 14px;
	}
	.wrong {
		text-decoration: line-through;
		opacity: 0.7;
	}
	strong {
		font-weight: 700;
	}
	@keyframes slideIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
