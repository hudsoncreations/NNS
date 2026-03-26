<script lang="ts">
	type Props = {
		slots: string[];         // Labels for drop slots (e.g. ["I", "ii", "iii", ...])
		items: string[];         // Shuffled items to drag (e.g. chord names)
		onAnswer: (answer: string[]) => void;
		disabled?: boolean;
	};

	let { slots, items, onAnswer, disabled = false }: Props = $props();

	// Track which item is placed in each slot
	const slotCount = $derived(slots.length);
	let placed = $state<(string | null)[]>([]);

	$effect(() => {
		placed = new Array(slotCount).fill(null);
	});
	let dragItem = $state<string | null>(null);

	const availableItems = $derived(
		items.filter((item) => !placed.includes(item))
	);

	const allPlaced = $derived(placed.every((p) => p !== null));

	function handleDragStart(item: string) {
		if (disabled) return;
		dragItem = item;
	}

	function handleDrop(slotIndex: number) {
		if (disabled || !dragItem) return;
		// If slot already has an item, put it back
		const newPlaced = [...placed];
		newPlaced[slotIndex] = dragItem;
		placed = newPlaced;
		dragItem = null;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function removeFromSlot(slotIndex: number) {
		if (disabled) return;
		const newPlaced = [...placed];
		newPlaced[slotIndex] = null;
		placed = newPlaced;
	}

	// Tap-based alternative to drag: tap item, then tap slot
	let tappedItem = $state<string | null>(null);

	function tapItem(item: string) {
		if (disabled) return;
		tappedItem = item;
	}

	function tapSlot(slotIndex: number) {
		if (disabled) return;
		if (tappedItem) {
			const newPlaced = [...placed];
			newPlaced[slotIndex] = tappedItem;
			placed = newPlaced;
			tappedItem = null;
		}
	}

	function submit() {
		if (disabled || !allPlaced) return;
		onAnswer(placed as string[]);
	}
</script>

<div class="drag-drop">
	<div class="slots">
		{#each slots as label, i}
			<div
				class="slot"
				class:filled={placed[i] !== null}
				class:drop-target={tappedItem !== null && placed[i] === null}
				role="button"
				tabindex="0"
				ondragover={handleDragOver}
				ondrop={() => handleDrop(i)}
				onclick={() => placed[i] ? removeFromSlot(i) : tapSlot(i)}
				onkeydown={(e) => e.key === 'Enter' && (placed[i] ? removeFromSlot(i) : tapSlot(i))}
			>
				<div class="slot-label">{label}</div>
				{#if placed[i]}
					<div class="slot-value">{placed[i]}</div>
				{:else}
					<div class="slot-empty">?</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="items">
		{#each availableItems as item}
			<button
				class="drag-item"
				class:tapped={tappedItem === item}
				draggable={!disabled}
				ondragstart={() => handleDragStart(item)}
				onclick={() => tapItem(item)}
				{disabled}
			>
				{item}
			</button>
		{/each}
	</div>

	<button class="submit-btn" onclick={submit} disabled={disabled || !allPlaced}>
		Submit
	</button>
</div>

<style>
	.drag-drop {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.slots {
		display: flex;
		gap: 4px;
	}
	.slot {
		flex: 1;
		background: var(--color-bg-card);
		border: 2px dashed var(--color-border);
		border-radius: 8px;
		padding: 8px 4px;
		text-align: center;
		min-height: 56px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		cursor: pointer;
		transition: border-color 0.15s;
	}
	.slot.filled {
		border-style: solid;
		border-color: var(--color-success);
	}
	.slot.drop-target {
		border-color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
	}
	.slot-label {
		font-size: 10px;
		color: var(--color-text-muted);
		font-weight: 600;
	}
	.slot-value {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-success);
	}
	.slot-empty {
		font-size: 16px;
		color: var(--color-primary);
	}
	.items {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
	}
	.drag-item {
		background: var(--color-primary);
		color: var(--color-bg);
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		cursor: grab;
		transition: transform 0.1s, opacity 0.15s;
	}
	.drag-item:active {
		cursor: grabbing;
		transform: scale(0.95);
	}
	.drag-item.tapped {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
	.submit-btn {
		background: var(--color-primary);
		color: var(--color-bg);
		border-radius: 10px;
		padding: 12px;
		font-size: 15px;
		font-weight: 600;
		transition: opacity 0.15s;
		align-self: center;
		min-width: 160px;
	}
	.submit-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
