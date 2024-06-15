<script>
	import Icon from '@iconify/svelte';

	export let value = '';
	export let error = '';
	export let disabled = false;

	let showPassword = false;
	let inputClasses = 'input-group input-group-divider grid-cols-[1fr_auto]';

	$: {
		inputClasses =
			'input-group input-group-divider grids-cols-[1fr_auto]' +
			(error.length ? ' input-warning' : '');
	}

	// @ts-ignore
	function handleChange(event) {
		value = event.target.value;
	}

	function handleBlur() {
		if (value.length === 0) {
			error = 'Password is required';
		} else {
			error = '';
		}
	}
</script>

<h6 class="h6 mt-3">Password</h6>
<div class={inputClasses}>
	<input
		type={showPassword ? 'text' : 'password'}
		{disabled}
		placeholder="Enter password..."
		on:blur={handleBlur}
		on:input={handleChange}
	/>
	{#if showPassword}
		<div>
			<button
				type="button"
				class="btn-icon !bg-transparent"
				on:click={() => (showPassword = !showPassword)}
			>
				<Icon icon="gridicons:not-visible" />
			</button>
		</div>
	{:else}
		<div>
			<button
				type="button"
				class="btn-icon !bg-transparent"
				on:click={() => (showPassword = !showPassword)}
			>
				<Icon icon="gridicons:visible" />
			</button>
		</div>
	{/if}
</div>
{#if error.length !== 0}
	<p class="text-red-500">{error}</p>
{/if}

<style>
	.input-group {
	  display: flex;
	  align-items: center;
	}
  
	.input-group input {
	  flex: 1;
	  padding: 0.5rem;
	  border-right: none;
	  border-radius: 4px 0 0 4px;
	}
  
	.input-group button {
	  border-left: none;
	  background: transparent;
	  padding: 0.5rem;
	  cursor: pointer;
	  border-radius: 0 4px 4px 0;
	}
  </style>
  