<script lang="ts">
	type Props = {
		options: string[];
		onAnswer: (answer: string) => void;
		disabled?: boolean;
	};

	let { options, onAnswer, disabled = false }: Props = $props();
	let selected = $state<string | null>(null);

	function select(option: string) {
		if (disabled) return;
		selected = option;
		onAnswer(option);
	}
</script>

<div class="choice-grid">
	{#each options as option}
		<button
			class="choice-btn"
			class:selected={selected === option}
			{disabled}
			onclick={() => select(option)}
		>
			{option}
		</button>
	{/each}
</div>

<style>
	.choice-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.choice-btn {
		background: var(--color-bg-card);
		border: 2px solid var(--color-border);
		border-radius: 10px;
		padding: 14px 8px;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
		transition: all 0.15s;
	}
	.choice-btn:not(:disabled):hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
	.choice-btn.selected {
		border-color: var(--color-primary);
		background: var(--color-primary);
		color: var(--color-bg);
	}
	.choice-btn:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
