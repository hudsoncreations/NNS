<script lang="ts">
	import '$lib/theme/global.css';
	import ThemeProvider from '$lib/theme/ThemeProvider.svelte';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>NNS ABCs</title>
	<meta name="description" content="Learn the Nashville Number System through interactive exercises" />
</svelte:head>

<ThemeProvider />
<Header />
<main>
	{@render children()}
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 16px;
		min-height: calc(100vh - 57px);
	}
</style>
