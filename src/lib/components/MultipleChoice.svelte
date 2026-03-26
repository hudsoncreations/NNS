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

<div class="choices">
	{#each options as option, i}
		<button
			class="btn-option"
			class:selected={selected === option}
			{disabled}
			onclick={() => select(option)}
		>
			<span class="option-number">{i + 1}</span>
			<span class="option-text">{option}</span>
		</button>
	{/each}
</div>

<style>
	.choices {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}
</style>
