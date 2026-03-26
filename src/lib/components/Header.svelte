<script lang="ts">
	import { page } from '$app/state';

	const isHome = $derived(page.url.pathname === '/' || page.url.pathname === '/explore');
	const showBack = $derived(!isHome);
</script>

<header>
	<div class="header-content">
		{#if showBack}
			<a href="/" class="back-btn" aria-label="Back to pathway">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M12 16l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		{/if}
		<h1 class="title">
			<a href="/">NNS ABCs</a>
		</h1>
		<a href="/settings" class="settings-btn" aria-label="Settings">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
				<circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
				<path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
		</a>
	</div>
</header>

<style>
	header {
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.header-content {
		max-width: 600px;
		margin: 0 auto;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.title {
		font-size: 18px;
		font-weight: 700;
		flex: 1;
	}
	.title a {
		color: var(--color-text);
		text-decoration: none;
	}
	.back-btn, .settings-btn {
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		padding: 4px;
		border-radius: 6px;
		transition: color 0.15s;
	}
	.back-btn:hover, .settings-btn:hover {
		color: var(--color-text);
		text-decoration: none;
	}
</style>
