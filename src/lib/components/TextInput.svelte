<script lang="ts">
	type Props = {
		placeholder?: string;
		onAnswer: (answer: string) => void;
		disabled?: boolean;
	};

	let { placeholder = 'Type your answer...', onAnswer, disabled = false }: Props = $props();
	let value = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	function submit() {
		if (disabled || !value.trim()) return;
		onAnswer(value.trim());
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
	}

	$effect(() => {
		// Reset value and autofocus when re-enabled (new question)
		if (!disabled && inputEl) {
			value = '';
			// Tick delay so DOM is settled
			setTimeout(() => inputEl?.focus(), 0);
		}
	});
</script>

<div class="text-input-wrap">
	<input
		bind:this={inputEl}
		type="text"
		bind:value
		{placeholder}
		{disabled}
		onkeydown={handleKeydown}
		class="text-input"
	/>
	<button class="submit-btn" onclick={submit} disabled={disabled || !value.trim()}>
		Submit
	</button>
</div>

<style>
	.text-input-wrap {
		display: flex;
		gap: 8px;
	}
	.text-input {
		flex: 1;
		background: var(--color-bg-card);
		border: 2px solid var(--color-border);
		border-radius: 10px;
		padding: 12px 16px;
		font-size: 16px;
		color: var(--color-text);
		font-family: inherit;
	}
	.text-input:focus {
		border-color: var(--color-primary);
		outline: none;
	}
	.submit-btn {
		background: var(--color-primary);
		color: var(--color-bg);
		border-radius: 10px;
		padding: 12px 20px;
		font-size: 14px;
		font-weight: 600;
		transition: opacity 0.15s;
	}
	.submit-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
