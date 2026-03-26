<script lang="ts">
	import { page } from '$app/state';
	import { progress } from '$lib/stores/index.svelte.js';
	import { EXERCISE_TYPES } from '$lib/exercises/config.js';
	import { KEY_ORDER } from '$lib/theory/index.js';
	import { onMount } from 'svelte';

	let mounted = $state(false);

	onMount(() => {
		progress.init();
		mounted = true;
	});

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

{#if mounted}
	<div class="page">
		<div class="key-header">
			<h2>{currentKey} Major</h2>
			<span class="key-position">{keyIndex + 1} of {KEY_ORDER.length}</span>
		</div>

		{#if nextKey && keyProgress.status !== 'completed'}
			<p class="unlock-hint">Complete all exercises to unlock {nextKey} Major</p>
		{:else if keyProgress.status === 'completed'}
			<p class="unlock-hint completed-hint">Key completed!</p>
		{/if}

		<div class="progress-summary">{completedCount} / {EXERCISE_TYPES.length} exercises done</div>

		<div class="exercise-grid">
			{#each exercises as exercise}
				<a
					href="/key/{encodeURIComponent(currentKey)}/{exercise.id}"
					class="exercise-tile"
				>
					<div class="tile-header">
						<span class="tile-name">{exercise.name}</span>
						<span class="tile-status">
							{#if exercise.progress.completed}
								<span class="status-icon done">&#10003;</span>
							{:else if exercise.progress.attempts > 0}
								<span class="status-icon in-progress">&#9684;</span>
							{:else}
								<span class="status-icon not-started">&#9675;</span>
							{/if}
						</span>
					</div>
					<p class="tile-desc">{exercise.description}</p>
					<div class="tile-score">
						{#if exercise.progress.attempts > 0}
							Best: {Math.round(exercise.progress.bestScore * 100)}%
						{:else}
							Not started
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</div>
{/if}

<style>
	.page {
		padding-top: 8px;
	}
	.key-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 4px;
	}
	.key-header h2 {
		font-size: 22px;
		font-weight: 700;
	}
	.key-position {
		color: var(--color-text-muted);
		font-size: 13px;
	}
	.unlock-hint {
		color: var(--color-text-subtle);
		font-size: 13px;
		margin-bottom: 12px;
	}
	.completed-hint {
		color: var(--color-success);
	}
	.progress-summary {
		color: var(--color-text-muted);
		font-size: 13px;
		margin-bottom: 16px;
	}
	.exercise-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.exercise-tile {
		background: var(--color-bg-card);
		border-radius: 10px;
		padding: 16px;
		text-decoration: none;
		color: var(--color-text);
		transition: transform 0.15s, box-shadow 0.15s;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.exercise-tile:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		text-decoration: none;
	}
	.tile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.tile-name {
		font-size: 13px;
		font-weight: 600;
	}
	.status-icon {
		font-size: 14px;
	}
	.status-icon.done {
		color: var(--color-success);
	}
	.status-icon.in-progress {
		color: var(--color-warning);
	}
	.status-icon.not-started {
		color: var(--color-text-subtle);
	}
	.tile-desc {
		font-size: 11px;
		color: var(--color-text-muted);
		line-height: 1.3;
	}
	.tile-score {
		font-size: 11px;
		margin-top: auto;
	}
</style>
