<script lang="ts">
	import { page } from '$app/state';
	import { progress } from '$lib/stores/index.svelte.js';
	import { KEY_ORDER } from '$lib/theory/index.js';
	import { onMount } from 'svelte';

	const tabParam = $derived(page.url.searchParams.get('tab'));
	let activeTab: 'pathway' | 'explore' = $state('pathway');
	let mounted = $state(false);

	onMount(() => {
		progress.init();
		if (tabParam === 'explore') activeTab = 'explore';
		mounted = true;
	});

	const keys = $derived(
		KEY_ORDER.map((key) => ({
			key,
			status: progress.getKeyProgress(key).status
		}))
	);
</script>

<div class="page">
	<div class="tab-bar">
		<button
			class="tab"
			class:active={activeTab === 'pathway'}
			onclick={() => activeTab = 'pathway'}
		>
			Pathway
		</button>
		<button
			class="tab"
			class:active={activeTab === 'explore'}
			onclick={() => activeTab = 'explore'}
		>
			Explore
		</button>
	</div>

	{#if mounted}
		<div class="key-grid">
			{#each keys as { key, status }}
				{@const isAccessible = activeTab === 'explore' || status !== 'locked'}
				<a
					href={isAccessible ? `/key/${encodeURIComponent(key)}` : undefined}
					class="key-circle"
					class:completed={status === 'completed'}
					class:active={status === 'in_progress' || activeTab === 'explore'}
					class:locked={status === 'locked' && activeTab !== 'explore'}
					aria-label="{key} major{status === 'locked' && activeTab !== 'explore' ? ' (locked)' : ''}"
				>
					<span class="key-name">{key}</span>
					{#if status === 'completed'}
						<span class="key-status">&#10003;</span>
					{:else if status === 'locked' && activeTab !== 'explore'}
						<span class="key-status lock">&#128274;</span>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page {
		padding-top: 8px;
	}
	.tab-bar {
		display: flex;
		gap: 4px;
		margin-bottom: 24px;
		background: var(--color-bg-card);
		border-radius: 10px;
		padding: 4px;
	}
	.tab {
		flex: 1;
		padding: 10px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-muted);
		transition: all 0.15s;
	}
	.tab.active {
		background: var(--color-primary);
		color: var(--color-bg);
	}
	.key-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		justify-items: center;
	}
	.key-circle {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 15px;
		text-decoration: none;
		transition: transform 0.15s, box-shadow 0.15s;
		position: relative;
	}
	.key-circle.completed {
		background: var(--color-success);
		color: var(--color-bg);
	}
	.key-circle.active {
		background: var(--color-primary);
		color: var(--color-bg);
	}
	.key-circle.locked {
		background: var(--color-bg-elevated);
		color: var(--color-text-muted);
		pointer-events: none;
	}
	.key-circle:not(.locked):hover {
		transform: scale(1.08);
		box-shadow: 0 4px 12px rgba(0,0,0,0.2);
	}
	.key-name {
		line-height: 1;
	}
	.key-status {
		font-size: 10px;
		line-height: 1;
		margin-top: 2px;
	}
	.key-status.lock {
		font-size: 10px;
		opacity: 0.6;
	}
</style>
