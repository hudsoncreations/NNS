<script lang="ts">
	import { page } from '$app/state';

	const isHome = $derived(page.url.pathname === '/' || page.url.pathname === '/explore');
	const showBack = $derived(!isHome);
</script>

<header>
	<nav class="header-nav">
		{#if showBack}
			<a href="/" class="back-btn" aria-label="Back to pathway">
				<svg width="22" height="22" viewBox="0 0 20 20" fill="none">
					<path d="M12 16l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		{/if}
		<h1 class="logo">
			<a href="/">NNS ABCs</a>
		</h1>
		<div class="header-actions">
			<a href="/settings" class="settings-btn" aria-label="Settings">
				<svg width="22" height="22" viewBox="0 0 20 20" fill="none">
					<circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
					<path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			</a>
		</div>
	</nav>
</header>

<style>
	header {
		background: var(--color-bg);
		border-bottom: 2px solid var(--color-border-muted);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.header-nav {
		max-width: 900px;
		margin: 0 auto;
		padding: 14px 24px;
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.logo {
		font-size: 24px;
		font-weight: 800;
		flex: 1;
	}
	.logo a {
		color: var(--color-success);
		text-decoration: none;
		letter-spacing: -0.5px;
	}
	.back-btn, .settings-btn {
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		padding: 6px;
		border-radius: 8px;
		transition: color 0.15s, background 0.15s;
	}
	.back-btn:hover, .settings-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-card);
		text-decoration: none;
	}
	.header-actions {
		display: flex;
		gap: 8px;
	}
</style>
