<script lang="ts">
	import '$lib/theme/global.css';
	import ThemeProvider from '$lib/theme/ThemeProvider.svelte';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Exercise pages get full-screen treatment (no header, pinned layout)
	const isExercisePage = $derived(
		page.route.id === '/key/[key]/[exercise]'
	);
</script>

<svelte:head>
	<title>NNS ABCs</title>
	<meta name="description" content="Learn the Nashville Number System through interactive exercises" />
</svelte:head>

<ThemeProvider />

{#if isExercisePage}
	<!-- Exercise: full viewport, no header -->
	<div class="exercise-layout">
		{@render children()}
	</div>
{:else}
	<Header />
	<main>
		{@render children()}
	</main>
{/if}

<style>
	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 24px 24px 48px;
		min-height: calc(100vh - 65px);
	}
	.exercise-layout {
		height: 100dvh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
</style>
