<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Logo from './Logo.svelte';

	const isHome = $derived(page.url.pathname === base + '/' || page.url.pathname === base + '/explore' || page.url.pathname === base);
	const showBack = $derived(!isHome);
</script>

<header>
	<nav class="header-nav">
		{#if showBack}
			<a href="{base}/" class="back-btn" aria-label="Back to pathway">
				<svg width="22" height="22" viewBox="0 0 20 20" fill="none">
					<path d="M12 16l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</a>
		{/if}
		<a href="{base}/" class="logo-link" aria-label="Home">
			<Logo />
		</a>
		<div class="header-spacer"></div>
		<div class="header-actions">
			<a href="{base}/settings" class="settings-btn" aria-label="Settings">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
					<path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="2"/>
					<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
		padding: 10px 24px;
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.logo-link {
		text-decoration: none;
		width: 90px;
		flex-shrink: 0;
	}
	.header-spacer {
		flex: 1;
	}
	.logo-link:hover {
		text-decoration: none;
		opacity: 0.85;
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
