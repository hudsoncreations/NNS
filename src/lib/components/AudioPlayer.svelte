<script lang="ts">
	import { playReferenceAndTarget, isPlaying } from '$lib/audio/index.js';

	type Props = {
		referenceNotes: string[];
		targetNotes: string[];
		speed?: number;
	};

	let { referenceNotes, targetNotes, speed = 1 }: Props = $props();
	let playing = $state(false);
	let hasPlayed = $state(false);

	async function play() {
		if (playing) return;
		playing = true;
		hasPlayed = true;
		try {
			await playReferenceAndTarget(referenceNotes, targetNotes);
		} finally {
			playing = false;
		}
	}
</script>

<button class="audio-btn" onclick={play} disabled={playing}>
	<div class="play-circle">
		{#if playing}
			<span class="playing-indicator">
				<span class="bar"></span>
				<span class="bar"></span>
				<span class="bar"></span>
			</span>
		{:else}
			<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
				<polygon points="6,4 20,12 6,20" />
			</svg>
		{/if}
	</div>
	<div class="play-info">
		<div class="play-label">{hasPlayed ? 'Replay' : 'Play'} Chords</div>
		<div class="play-desc">I chord &rarr; mystery chord</div>
	</div>
	<div class="speed-badge">{speed}x</div>
</button>

<style>
	.audio-btn {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 18px 22px;
		background: var(--color-bg-card);
		border: 2px solid var(--color-border);
		border-bottom: 4px solid var(--color-border);
		border-radius: 16px;
		cursor: pointer;
		width: 100%;
		transition: all 0.1s;
		text-align: left;
	}
	.audio-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
	}
	.audio-btn:active:not(:disabled) {
		border-bottom-width: 2px;
		transform: translateY(2px);
	}
	.audio-btn:disabled {
		opacity: 0.7;
	}
	.play-circle {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--color-primary);
		color: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.play-circle svg {
		margin-left: 3px;
	}
	.playing-indicator {
		display: flex;
		gap: 3px;
		align-items: flex-end;
		height: 20px;
	}
	.bar {
		width: 4px;
		background: var(--color-bg);
		border-radius: 2px;
		animation: pulse 0.8s ease-in-out infinite;
	}
	.bar:nth-child(1) { height: 8px; animation-delay: 0s; }
	.bar:nth-child(2) { height: 16px; animation-delay: 0.15s; }
	.bar:nth-child(3) { height: 12px; animation-delay: 0.3s; }
	@keyframes pulse {
		0%, 100% { transform: scaleY(1); }
		50% { transform: scaleY(1.6); }
	}
	.play-info {
		flex: 1;
	}
	.play-label {
		font-size: 17px;
		font-weight: 700;
	}
	.play-desc {
		font-size: 13px;
		color: var(--color-text-muted);
		margin-top: 2px;
	}
	.speed-badge {
		font-size: 13px;
		font-weight: 700;
		color: var(--color-text-muted);
		background: var(--color-bg-elevated);
		padding: 4px 10px;
		border-radius: 8px;
	}
</style>
