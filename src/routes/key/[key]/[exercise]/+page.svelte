<script lang="ts">
	import { page } from '$app/state';
	import { progress, userPreferences } from '$lib/stores/index.js';
	import { getExerciseType } from '$lib/exercises/config.js';
	import ExerciseRunner from '$lib/components/ExerciseRunner.svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);

	onMount(() => {
		progress.init();
		userPreferences.init();
		mounted = true;
	});

	const exerciseKey = $derived(decodeURIComponent(page.params.key));
	const exerciseId = $derived(page.params.exercise);
	const exerciseType = $derived(getExerciseType(exerciseId));
</script>

<svelte:head>
	<title>{exerciseType?.name ?? 'Exercise'} — {exerciseKey} Major | NNS ABCs</title>
</svelte:head>

{#if mounted && exerciseType}
	<div class="exercise-header">
		<h2>{exerciseType.name}</h2>
		<span class="exercise-key">{exerciseKey} Major</span>
	</div>

	<ExerciseRunner {exerciseKey} {exerciseId} />
{:else if mounted}
	<p>Exercise not found.</p>
{/if}

<style>
	.exercise-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 16px;
	}
	.exercise-header h2 {
		font-size: 18px;
		font-weight: 700;
	}
	.exercise-key {
		font-size: 13px;
		color: var(--color-text-muted);
	}
</style>
