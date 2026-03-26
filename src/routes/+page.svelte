<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { progress } from '$lib/stores/index.svelte.js';
	import { KEY_ORDER } from '$lib/theory/index.js';
	import { onMount } from 'svelte';
	import Logo from '$lib/components/Logo.svelte';

	const tabParam = $derived(page.url.searchParams.get('tab'));
	let activeTab: 'pathway' | 'explore' = $state('pathway');
	let mounted = $state(false);

	onMount(() => {
		progress.init();
		if (tabParam === 'explore') activeTab = 'explore';
		mounted = true;
	});

	// Circle of fifths: key + angle (degrees clockwise from 12 o'clock)
	const CIRCLE_KEYS = [
		{ key: 'C', angle: 0 },
		{ key: 'G', angle: 30 },
		{ key: 'D', angle: 60 },
		{ key: 'A', angle: 90 },
		{ key: 'E', angle: 120 },
		{ key: 'B', angle: 150 },
		{ key: 'Gb', angle: 180 },
		{ key: 'Db', angle: 210 },
		{ key: 'Ab', angle: 240 },
		{ key: 'Eb', angle: 270 },
		{ key: 'Bb', angle: 300 },
		{ key: 'F', angle: 330 },
	];

	const RADIUS = 36; // % of container from center

	// Learning order index for each key (shown in Pathway tab)
	const learningOrder = new Map(KEY_ORDER.map((k, i) => [k, i + 1]));

	const circleNodes = $derived(
		CIRCLE_KEYS.map(({ key, angle }) => {
			const rad = angle * (Math.PI / 180);
			const status = progress.getKeyProgress(key).status;
			return {
				key,
				angle,
				status,
				order: learningOrder.get(key) ?? 0,
				exercisesDone: (['chordSpelling', 'identifyNumber', 'identifyChord', 'audioId'] as const)
					.filter((ex) => progress.getExerciseProgress(key, ex).completed).length,
				left: 50 + Math.sin(rad) * RADIUS,
				top: 50 - Math.cos(rad) * RADIUS,
			};
		})
	);
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

		<!-- Circle of Fifths -->
		<div class="circle-wrap">
			<div class="circle-container">
				<!-- Decorative ring -->
				<svg class="circle-ring" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--color-border-muted)" stroke-width="0.3" stroke-dasharray="1.5 1.5" opacity="0.5" />
				</svg>

				<!-- Center logo -->
				<div class="circle-center-label">
					<Logo />
				</div>

				<!-- Key nodes positioned around the circle -->
				{#each circleNodes as { key, status, exercisesDone, order, left, top }}
					{@const isAccessible = activeTab === 'explore' || status !== 'locked'}
					{@const isCurrent = status === 'in_progress'}
					{@const isDone = status === 'completed'}
					<div class="circle-node" style="left: {left}%; top: {top}%">
						{#if isAccessible}
							<a
								href="{base}/key/{encodeURIComponent(key)}"
								class="key-node"
								class:current={isCurrent || activeTab === 'explore'}
								class:done={isDone}
								aria-label="{key} major"
							>
								<div class="node-inner" class:done={isDone} class:current={!isDone && (isCurrent || activeTab === 'explore')}>
									<span class="node-label">{key}</span>
								</div>
								<div class="node-progress-dots">
									{#each Array(4) as _, i}
										<div class="dot" class:filled={i < exercisesDone}></div>
									{/each}
								</div>
							</a>
						{:else}
							<div class="key-node locked" aria-label="{key} major (locked)">
								<div class="node-inner locked">
									<span class="node-label">{key}</span>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.home {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 12px;
		min-height: calc(100vh - 70px);
	}
	.tab-bar {
		display: flex;
		gap: 4px;
		margin-bottom: 20px;
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

	/* Circle of fifths layout */
	.circle-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		flex: 1;
		padding: 10px 0 20px;
	}

	.circle-container {
		position: relative;
		/* Fill available space: use the smaller of width or remaining height */
		width: min(680px, 88vw, calc(100vh - 200px));
		aspect-ratio: 1;
	}

	.circle-ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.circle-center-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
		width: 30%;
		max-width: 180px;
	}

	.circle-node {
		position: absolute;
		transform: translate(-50%, -50%);
		z-index: 1;
	}

	.key-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		text-decoration: none;
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
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	}

	.key-node:not(.locked):active .node-inner {
		border-bottom-width: 2px;
		transform: translateY(2px);
	}

	.node-label {
		line-height: 1;
	}

	.node-progress-dots {
		display: flex;
		gap: 3px;
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-bg-elevated);
	}
	.dot.filled {
		background: var(--color-success);
	}

	/* Mobile: keep circle but shrink nodes to fit */
	@media (max-width: 480px) {
		.home {
			padding-top: 8px;
		}
		.tab-bar {
			margin-bottom: 12px;
		}
		.circle-wrap {
			padding: 0 0 12px;
		}
		.node-inner {
			width: 50px;
			height: 50px;
			font-size: 16px;
			border-bottom-width: 4px;
		}
		.key-node {
			gap: 3px;
		}
		.node-progress-dots {
			gap: 2px;
		}
		.dot {
			width: 5px;
			height: 5px;
		}
		.circle-center-label {
			width: 22%;
		}
	}
</style>
