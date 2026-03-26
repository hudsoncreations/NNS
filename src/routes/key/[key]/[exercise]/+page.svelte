<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { progress, userPreferences } from '$lib/stores/index.svelte.js';
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
	<ExerciseRunner {exerciseKey} {exerciseId} />
{:else if mounted}
	<div class="not-found">
		<p>Exercise not found.</p>
		<a href="{base}/" class="btn-3d ghost">Back to Home</a>
	</div>
{/if}

<style>
	.not-found {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: 16px;
		font-size: 18px;
		color: var(--color-text-muted);
	}
</style>
