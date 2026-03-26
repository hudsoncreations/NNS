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
		KEY_ORDER.map((key, i) => ({
			key,
			index: i,
			status: progress.getKeyProgress(key).status,
			exercisesDone: (['chordSpelling', 'identifyNumber', 'identifyChord', 'audioId']
				.filter((ex) => progress.getExerciseProgress(key, ex).completed).length)
		}))
	);

	// Zigzag offsets for the winding path (like Duolingo)
	const offsets = [0, 60, 90, 60, 0, -60, -90, -60, 0, 60, 90, 60];
</script>

{#if mounted}
	<div class="home">
		<!-- Tab switcher -->
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

		<!-- Winding pathway -->
		<div class="pathway">
			{#each keys as { key, index, status, exercisesDone }}
				{@const isAccessible = activeTab === 'explore' || status !== 'locked'}
				{@const isCurrent = status === 'in_progress'}
				{@const isDone = status === 'completed'}
				<div class="node-row" style="transform: translateX({offsets[index]}px)">
					{#if isAccessible}
						<a
							href="/key/{encodeURIComponent(key)}"
							class="key-node"
							class:current={isCurrent || activeTab === 'explore'}
							class:done={isDone}
							aria-label="{key} major"
						>
							{#if isDone}
								<div class="node-inner done">
									<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
										<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</div>
							{:else if isCurrent || activeTab === 'explore'}
								<div class="node-inner current">
									<span class="node-label">{key}</span>
								</div>
								{#if isCurrent && activeTab === 'pathway'}
									<div class="start-badge">START</div>
								{/if}
							{/if}
							<div class="node-progress-dots">
								{#each Array(4) as _, i}
									<div class="dot" class:filled={i < exercisesDone}></div>
								{/each}
							</div>
						</a>
					{:else}
						<div class="key-node locked" aria-label="{key} major (locked)">
							<div class="node-inner locked">
								<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
									<rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
									<path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
								</svg>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.home {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 12px;
	}
	.tab-bar {
		display: flex;
		gap: 4px;
		margin-bottom: 40px;
		background: var(--color-bg-card);
		border-radius: 14px;
		padding: 4px;
		width: 100%;
		max-width: 320px;
	}
	.tab {
		flex: 1;
		padding: 12px;
		border-radius: 12px;
		font-size: 15px;
		font-weight: 700;
		color: var(--color-text-muted);
		transition: all 0.15s;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.tab.active {
		background: var(--color-primary);
		color: var(--color-bg);
		border-bottom: 3px solid color-mix(in srgb, var(--color-primary) 70%, black);
	}

	.pathway {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding-bottom: 60px;
	}

	.node-row {
		transition: transform 0.3s ease;
	}

	.key-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		position: relative;
	}
	.key-node:hover {
		text-decoration: none;
	}

	.node-inner {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: 20px;
		transition: transform 0.15s, box-shadow 0.15s;
		border-bottom: 5px solid;
	}

	.node-inner.current {
		background: var(--color-primary);
		color: var(--color-bg);
		border-bottom-color: color-mix(in srgb, var(--color-primary) 65%, black);
	}

	.node-inner.done {
		background: var(--color-success);
		color: var(--color-bg);
		border-bottom-color: color-mix(in srgb, var(--color-success) 65%, black);
	}

	.node-inner.locked {
		background: var(--color-bg-elevated);
		color: var(--color-text-subtle);
		border-bottom-color: color-mix(in srgb, var(--color-bg-elevated) 70%, black);
	}

	.key-node:not(.locked):hover .node-inner {
		transform: scale(1.08);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	}

	.key-node:not(.locked):active .node-inner {
		border-bottom-width: 2px;
		transform: translateY(3px);
	}

	.node-label {
		line-height: 1;
	}

	.start-badge {
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-primary);
		color: var(--color-bg);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 1px;
		padding: 3px 10px;
		border-radius: 8px;
		text-transform: uppercase;
		pointer-events: none;
	}

	.node-progress-dots {
		display: flex;
		gap: 4px;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-bg-elevated);
	}
	.dot.filled {
		background: var(--color-success);
	}
</style>
