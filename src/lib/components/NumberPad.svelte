<script lang="ts">
	import type { Chord } from '$lib/theory/index.js';

	type Props = {
		chords: Chord[];
		onAnswer: (answer: string) => void;
		disabled?: boolean;
	};

	let { chords, onAnswer, disabled = false }: Props = $props();

	function handleClick(degree: number) {
		if (disabled) return;
		const chord = chords[degree - 1];
		if (chord) onAnswer(chord.roman);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (disabled) return;
		const num = parseInt(e.key);
		if (num >= 1 && num <= 7) {
			e.preventDefault();
			handleClick(num);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="numpad">
	{#each [1, 2, 3, 4, 5, 6] as n}
		<button class="numpad-btn" onclick={() => handleClick(n)} {disabled}>
			<span class="num">{chords[n - 1]?.roman ?? n}</span>
		</button>
	{/each}
	<div></div>
	<button class="numpad-btn" onclick={() => handleClick(7)} {disabled}>
		<span class="num">{chords[6]?.roman ?? 7}</span>
	</button>
	<div></div>
</div>

<style>
	.numpad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		max-width: 380px;
		width: 100%;
	}
	.numpad-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 14px 10px;
		background: var(--color-bg-card);
		border: 2px solid var(--color-border);
		border-bottom: 4px solid var(--color-border);
		border-radius: 14px;
		transition: all 0.1s;
		cursor: pointer;
	}
	.numpad-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 8%, var(--color-bg-card));
	}
	.numpad-btn:active:not(:disabled) {
		border-bottom-width: 2px;
		transform: translateY(2px);
	}
	.numpad-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.num {
		font-size: 22px;
		font-weight: 800;
		color: var(--color-text);
		line-height: 1;
	}
</style>
