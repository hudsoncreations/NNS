<script lang="ts">
	import { tick } from 'svelte';

	type Props = {
		options: string[];
		onAnswer: (answer: string) => void;
		disabled?: boolean;
	};

	let { options, onAnswer, disabled = false }: Props = $props();
	let selected = $state<string | null>(null);
	let btnEls: (HTMLButtonElement | undefined)[] = $state([]);

	function select(option: string) {
		if (disabled) return;
		selected = option;
		onAnswer(option);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (disabled) return;

		// Number keys to select directly
		const num = parseInt(e.key);
		if (num >= 1 && num <= options.length) {
			e.preventDefault();
			select(options[num - 1]);
			return;
		}

		const btns = btnEls.filter((el): el is HTMLButtonElement => !!el);
		const currentIdx = btns.findIndex((el) => el === document.activeElement);

		if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			e.preventDefault();
			const next = currentIdx < btns.length - 1 ? currentIdx + 1 : 0;
			btns[next].focus();
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			e.preventDefault();
			const prev = currentIdx > 0 ? currentIdx - 1 : btns.length - 1;
			btns[prev].focus();
		}
	}

	$effect(() => {
		// Auto-focus first option when not disabled (new question)
		if (!disabled) {
			tick().then(() => btnEls[0]?.focus());
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="choices">
	{#each options as option, i}
		<button
			bind:this={btnEls[i]}
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
