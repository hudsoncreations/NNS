<script lang="ts">
	import { userPreferences, progress, type Difficulty, type ThemeMode, type TimerDuration } from '$lib/stores/index.svelte.js';
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

	function handleTimerToggle(enabled: boolean) {
		userPreferences.update({ timerEnabled: enabled });
	}

	function handleTimerDuration(duration: TimerDuration) {
		userPreferences.update({ timerDuration: duration });
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
	const timerDurations: { value: TimerDuration; label: string }[] = [
		{ value: 120, label: '2 min' },
		{ value: 60, label: '1 min' },
		{ value: 30, label: '30s' },
		{ value: 15, label: '15s' }
	];
</script>

<svelte:head>
	<title>Settings | NNS ABCs</title>
</svelte:head>

{#if mounted}
	<div class="settings">
		<h2>Settings</h2>

		<div class="settings-card">
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

			<section>
				<h3>Exercise Timer</h3>
				<p class="section-desc">Add a countdown timer to exercises</p>
				<div class="option-row">
					<button
						class="option-btn"
						class:active={!userPreferences.value.timerEnabled}
						onclick={() => handleTimerToggle(false)}
					>
						Off
					</button>
					<button
						class="option-btn"
						class:active={userPreferences.value.timerEnabled}
						onclick={() => handleTimerToggle(true)}
					>
						On
					</button>
				</div>
				{#if userPreferences.value.timerEnabled}
					<div class="option-row">
						{#each timerDurations as dur}
							<button
								class="option-btn"
								class:active={userPreferences.value.timerDuration === dur.value}
								onclick={() => handleTimerDuration(dur.value)}
							>
								{dur.label}
							</button>
						{/each}
					</div>
				{/if}
			</section>
		</div>

		<div class="settings-card danger-card">
			<section>
				<h3>Data</h3>
				<button class="btn-3d danger" onclick={resetProgress}>
					Reset All Progress
				</button>
			</section>
		</div>
	</div>
{/if}

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-width: 560px;
		margin: 0 auto;
	}
	h2 {
		font-size: 28px;
		font-weight: 800;
	}
	.settings-card {
		background: var(--color-bg-card);
		border: 2px solid var(--color-border);
		border-radius: 16px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.danger-card {
		border-color: color-mix(in srgb, var(--color-error) 30%, var(--color-border));
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	h3 {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-size: 13px;
	}
	.section-desc {
		font-size: 13px;
		color: var(--color-text-muted);
		margin-top: -6px;
	}
	.slider-row {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.slider {
		flex: 1;
		accent-color: var(--color-primary);
		height: 8px;
	}
	.slider-value {
		font-size: 16px;
		font-weight: 700;
		min-width: 48px;
		text-align: right;
	}
	.option-row {
		display: flex;
		gap: 8px;
	}
	.option-btn {
		flex: 1;
		padding: 12px 8px;
		background: var(--color-bg);
		border: 2px solid var(--color-border);
		border-bottom: 4px solid var(--color-border);
		border-radius: 12px;
		font-size: 14px;
		font-weight: 700;
		color: var(--color-text);
		transition: all 0.1s;
	}
	.option-btn:active {
		border-bottom-width: 2px;
		transform: translateY(2px);
	}
	.option-btn.active {
		border-color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 12%, var(--color-bg));
		color: var(--color-primary);
	}
</style>
