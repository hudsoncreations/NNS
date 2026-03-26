<script lang="ts">
	import { base } from '$app/paths';
</script>

<div class="logo">
	<img src="{base}/NNSFD%20Logo%20Dark.png" alt="Nashville No. System For Dummies" class="logo-img dark-logo" />
	<img src="{base}/NNSFD%20Logo%20Light.png" alt="Nashville No. System For Dummies" class="logo-img light-logo" />
</div>

<style>
	.logo {
		display: inline-block;
		line-height: 0;
	}
	.logo-img {
		width: 100%;
		height: auto;
		display: block;
	}

	/* Default (dark mode): show light logo, hide dark */
	.dark-logo { display: none; }
	.light-logo { display: block; }

	/* Explicit light theme */
	:global([data-theme="light"]) .dark-logo { display: block; }
	:global([data-theme="light"]) .light-logo { display: none; }

	/* System preference: light */
	@media (prefers-color-scheme: light) {
		:global([data-theme="system"]) .dark-logo { display: block; }
		:global([data-theme="system"]) .light-logo { display: none; }
	}
</style>
