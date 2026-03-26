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

<div class="audio-player">
	<button class="play-btn" onclick={play} disabled={playing} aria-label="Play chords">
		{#if playing}
			<span class="playing-indicator">
				<span class="bar"></span>
				<span class="bar"></span>
				<span class="bar"></span>
			</span>
		{:else}
			<span class="play-icon">&#9654;</span>
		{/if}
	</button>
	<div class="play-info">
		<div class="play-label">{hasPlayed ? 'Replay' : 'Play'} Chords</div>
		<div class="play-desc">I chord &rarr; ? chord</div>
	</div>
	<div class="speed-label">{speed}x</div>
</div>

<style>
	.audio-player {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		background: var(--color-bg-card);
		border-radius: 12px;
	}
	.play-btn {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-primary);
		color: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		transition: transform 0.15s;
		flex-shrink: 0;
	}
	.play-btn:not(:disabled):hover {
		transform: scale(1.05);
	}
	.play-btn:disabled {
		opacity: 0.7;
	}
	.play-icon {
		margin-left: 3px;
	}
	.playing-indicator {
		display: flex;
		gap: 3px;
		align-items: flex-end;
		height: 18px;
	}
	.bar {
		width: 3px;
		background: var(--color-bg);
		border-radius: 2px;
		animation: pulse 0.8s ease-in-out infinite;
	}
	.bar:nth-child(1) { height: 8px; animation-delay: 0s; }
	.bar:nth-child(2) { height: 14px; animation-delay: 0.15s; }
	.bar:nth-child(3) { height: 10px; animation-delay: 0.3s; }
	@keyframes pulse {
		0%, 100% { transform: scaleY(1); }
		50% { transform: scaleY(1.6); }
	}
	.play-info {
		flex: 1;
	}
	.play-label {
		font-size: 14px;
		font-weight: 600;
	}
	.play-desc {
		font-size: 12px;
		color: var(--color-text-muted);
	}
	.speed-label {
		font-size: 12px;
		color: var(--color-text-muted);
	}
</style>
