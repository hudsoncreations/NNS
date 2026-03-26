<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to home with explore tab — the home page handles both tabs
		goto('/?tab=explore', { replaceState: true });
	});
</script>
