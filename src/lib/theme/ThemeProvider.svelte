<script lang="ts">
	import { userPreferences } from '$lib/stores/index.svelte.js';
	import { onMount } from 'svelte';

	onMount(() => {
		userPreferences.init();
		applyTheme();
	});

	function applyTheme() {
		const theme = userPreferences.value.theme;
		document.documentElement.setAttribute('data-theme', theme);
	}

	$effect(() => {
		applyTheme();
	});
</script>
