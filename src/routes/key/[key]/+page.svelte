<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { progress } from '$lib/stores/index.svelte.js';
	import { EXERCISE_TYPES } from '$lib/exercises/config.js';
	import { KEY_ORDER } from '$lib/theory/index.js';
	import { onMount, tick } from 'svelte';

	let mounted = $state(false);
	let tileEls: (HTMLAnchorElement | undefined)[] = $state([]);

	onMount(() => {
		progress.init();
		mounted = true;
		// Auto-focus first tile after mount
		tick().then(() => tileEls[0]?.focus());
	});

	function handleKeydown(e: KeyboardEvent) {
		const tiles = tileEls.filter((el): el is HTMLAnchorElement => !!el);
		if (!tiles.length) return;

		const currentIdx = tiles.findIndex((el) => el === document.activeElement);

		if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			e.preventDefault();
			const next = currentIdx < tiles.length - 1 ? currentIdx + 1 : 0;
			tiles[next].focus();
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			e.preventDefault();
			const prev = currentIdx > 0 ? currentIdx - 1 : tiles.length - 1;
			tiles[prev].focus();
		}

		// Number keys 1-4 to jump directly
		const num = parseInt(e.key);
		if (num >= 1 && num <= tiles.length) {
			e.preventDefault();
			tiles[num - 1].focus();
		}
	}

	const currentKey = $derived(decodeURIComponent(page.params.key));
	const keyIndex = $derived(KEY_ORDER.indexOf(currentKey));
	const keyProgress = $derived(progress.getKeyProgress(currentKey));

	const nextKey = $derived(
		keyIndex >= 0 && keyIndex < KEY_ORDER.length - 1 ? KEY_ORDER[keyIndex + 1] : null
	);

	const exercises = $derived(
		EXERCISE_TYPES.map((ex) => {
			const ep = progress.getExerciseProgress(currentKey, ex.id);
			return { ...ex, progress: ep };
		})
	);

	const completedCount = $derived(
		exercises.filter((e) => e.progress.completed).length
	);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if mounted}
	<div class="page">
		<div class="key-hero">
			<h2>{currentKey} Major</h2>
			<span class="key-position">{keyIndex + 1} of {KEY_ORDER.length}</span>
		</div>

		{#if nextKey && keyProgress.status !== 'completed'}
			<p class="unlock-hint">Complete all exercises to unlock <strong>{nextKey} Major</strong></p>
		{:else if keyProgress.status === 'completed'}
			<p class="unlock-hint completed-hint">Key completed!</p>
		{/if}

		<!-- Progress ring -->
		<div class="progress-ring-wrap">
			<div class="progress-ring">
				<span class="ring-number">{completedCount}</span>
				<span class="ring-label">/ {EXERCISE_TYPES.length}</span>
			</div>
		</div>

		<div class="exercise-grid">
			{#each exercises as exercise, i}
				<a
					bind:this={tileEls[i]}
					href="{base}/key/{encodeURIComponent(currentKey)}/{exercise.id}"
					class="exercise-tile"
					class:completed={exercise.progress.completed}
				>
					<div class="tile-icon">
						{#if exercise.progress.completed}
							<div class="icon-circle done">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</div>
						{:else if exercise.progress.attempts > 0}
							<div class="icon-circle in-progress">
								<span>{Math.round(exercise.progress.bestScore * 100)}%</span>
							</div>
						{:else}
							<div class="icon-circle not-started">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M8 5l8 7-8 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</div>
						{/if}
					</div>
					<div class="tile-content">
						<span class="tile-name">{exercise.name}</span>
						<span class="tile-desc">{exercise.description}</span>
					</div>
				</a>
			{/each}
		</div>
	</div>
{/if}

<style>
	.page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 16px;
	}
	.key-hero {
		text-align: center;
		margin-bottom: 8px;
	}
	.key-hero h2 {
		font-size: 32px;
		font-weight: 800;
	}
	.key-position {
		color: var(--color-text-muted);
		font-size: 14px;
		font-weight: 600;
	}
	.unlock-hint {
		color: var(--color-text-subtle);
		font-size: 14px;
		text-align: center;
		margin-bottom: 20px;
	}
	.completed-hint {
		color: var(--color-success);
		font-weight: 700;
	}

	.progress-ring-wrap {
		margin-bottom: 32px;
	}
	.progress-ring {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: var(--color-bg-card);
		border: 4px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
	}
	.ring-number {
		font-size: 28px;
		font-weight: 800;
		color: var(--color-primary);
	}
	.ring-label {
		font-size: 16px;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.exercise-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		max-width: 560px;
	}
	.exercise-tile {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 18px 20px;
		background: var(--color-bg-card);
		border: 2px solid var(--color-border);
		border-bottom: 4px solid var(--color-border);
		border-radius: 16px;
		text-decoration: none;
		color: var(--color-text);
		transition: all 0.1s;
	}
	.exercise-tile:hover,
	.exercise-tile:focus-visible {
		border-color: var(--color-text-muted);
		background: var(--color-bg-elevated);
		text-decoration: none;
		outline: none;
	}
	.exercise-tile:focus-visible {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 30%, transparent);
	}
	.exercise-tile:active {
		border-bottom-width: 2px;
		transform: translateY(2px);
	}
	.exercise-tile.completed {
		border-color: var(--color-success);
	}

	.icon-circle {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: 14px;
		flex-shrink: 0;
	}
	.icon-circle.done {
		background: var(--color-success);
		color: var(--color-bg);
	}
	.icon-circle.in-progress {
		background: var(--color-warning);
		color: var(--color-bg);
	}
	.icon-circle.not-started {
		background: var(--color-bg-elevated);
		color: var(--color-text-muted);
	}

	.tile-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.tile-name {
		font-size: 16px;
		font-weight: 700;
	}
	.tile-desc {
		font-size: 13px;
		color: var(--color-text-muted);
	}
</style>
