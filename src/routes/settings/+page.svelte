<script lang="ts">
	import { userPreferences, progress, type Difficulty, type ThemeMode } from '$lib/stores/index.js';
	import { setVolume, setPlaybackSpeed } from '$lib/audio/index.js';
	import { onMount } from 'svelte';

	let mounted = $state(false);

	onMount(() => {
		userPreferences.init();
		progress.init();
		mounted = true;
	});

	function handleVolume(e: Event) {
		const value = Number((e.target as HTMLInputElement).value) / 100;
		userPreferences.update({ volume: value });
		setVolume(value);
	}

	function handleSpeed(speed: number) {
		userPreferences.update({ playbackSpeed: speed });
		setPlaybackSpeed(speed);
	}

	function handleDifficulty(diff: Difficulty) {
		userPreferences.update({ difficulty: diff });
	}

	function handleTheme(theme: ThemeMode) {
		userPreferences.update({ theme });
	}

	function resetProgress() {
		if (confirm('Reset all progress? This cannot be undone.')) {
			progress.reset();
		}
	}

	const speeds = [0.75, 1, 1.25, 1.5];
	const difficulties: { value: Difficulty; label: string }[] = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' }
	];
	const themes: { value: ThemeMode; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];
</script>

<svelte:head>
	<title>Settings | NNS ABCs</title>
</svelte:head>

{#if mounted}
	<div class="settings">
		<h2>Settings</h2>

		<!-- Volume -->
		<section>
			<h3>Volume</h3>
			<div class="slider-row">
				<input
					type="range"
					min="0"
					max="100"
					value={Math.round(userPreferences.value.volume * 100)}
					oninput={handleVolume}
					class="slider"
				/>
				<span class="slider-value">{Math.round(userPreferences.value.volume * 100)}%</span>
			</div>
		</section>

		<!-- Playback Speed -->
		<section>
			<h3>Playback Speed</h3>
			<div class="option-row">
				{#each speeds as speed}
					<button
						class="option-btn"
						class:active={userPreferences.value.playbackSpeed === speed}
						onclick={() => handleSpeed(speed)}
					>
						{speed}x
					</button>
				{/each}
			</div>
		</section>

		<!-- Difficulty -->
		<section>
			<h3>Difficulty</h3>
			<p class="section-desc">Controls input method for exercises</p>
			<div class="option-row">
				{#each difficulties as diff}
					<button
						class="option-btn"
						class:active={userPreferences.value.difficulty === diff.value}
						onclick={() => handleDifficulty(diff.value)}
					>
						{diff.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Theme -->
		<section>
			<h3>Theme</h3>
			<div class="option-row">
				{#each themes as theme}
					<button
						class="option-btn"
						class:active={userPreferences.value.theme === theme.value}
						onclick={() => handleTheme(theme.value)}
					>
						{theme.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Reset -->
		<section>
			<h3>Data</h3>
			<button class="danger-btn" onclick={resetProgress}>
				Reset All Progress
			</button>
		</section>
	</div>
{/if}

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	h2 {
		font-size: 22px;
		font-weight: 700;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	h3 {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text-muted);
	}
	.section-desc {
		font-size: 12px;
		color: var(--color-text-subtle);
		margin-top: -4px;
	}
	.slider-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.slider {
		flex: 1;
		accent-color: var(--color-primary);
		height: 6px;
	}
	.slider-value {
		font-size: 14px;
		font-weight: 600;
		min-width: 44px;
		text-align: right;
	}
	.option-row {
		display: flex;
		gap: 8px;
	}
	.option-btn {
		flex: 1;
		padding: 10px 8px;
		background: var(--color-bg-card);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text);
		transition: all 0.15s;
	}
	.option-btn.active {
		border-color: var(--color-primary);
		background: var(--color-primary);
		color: var(--color-bg);
	}
	.danger-btn {
		background: color-mix(in srgb, var(--color-error) 15%, var(--color-bg-card));
		color: var(--color-error);
		border: 1px solid var(--color-error);
		border-radius: 8px;
		padding: 12px;
		font-size: 14px;
		font-weight: 600;
		transition: opacity 0.15s;
		align-self: flex-start;
	}
	.danger-btn:hover {
		opacity: 0.85;
	}
</style>
