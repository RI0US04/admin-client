<script>
	import Icon from '@iconify/svelte';
	// @ts-ignore
	import zxcvbn from 'zxcvbn';

	export let value = '';
	export let error = '';
	export let disabled = false;
	export let showPasswordStrength = true;

	let showPassword = false;
	let inputClasses = 'input-group input-group-divider grid-cols-[1fr_auto]';
	let passwordStrength = 0;
	let strengthText = '';
	let strengthColor = 'red';

// @ts-ignore
		$: {
		inputClasses =
			'input-group input-group-divider grid-cols-[1fr_auto]' +
			(error.length ? ' input-warning' : '');
	}

// @ts-ignore
		$: {
		// @ts-ignore
		const result = zxcvbn(value);
		passwordStrength = result.score;
		strengthText = getPasswordStrengthText(passwordStrength);
		strengthColor = getPasswordStrengthColor(passwordStrength);
	}

	// @ts-ignore
	function handleChange(event) {
		value = event.target.value;
	}

	function handleBlur() {
		var pattern = new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$"
        );
		if (value.length === 0) {
			error = 'Password is required';
		} else if (value.length < 8) {
			error = 'Password must be at least 8 characters long';
		} else if (value.length > 72) {
			error = 'Password should not be longer than 72 characters!';
		} else if (!pattern.test(value)) {
			error =
				'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!';
		} else {
			error = '';
		}
	}

	/**
	 * @param {number} score
	 */
	function getPasswordStrengthText(score) {
		switch (score) {
			case 0:
				return 'Very weak';
			case 1:
				return 'Weak';
			case 2:
				return 'Fair';
			case 3:
				return 'Good';
			case 4:
				return 'Strong';
			default:
				return '';
		}
	}

	/**
	 * @param {number} score
	 */
	function getPasswordStrengthColor(score) {
		switch (score) {
			case 0:
				return 'red';
			case 1:
				return 'orange';
			case 2:
				return 'yellow';
			case 3:
				return 'blue';
			case 4:
				return 'green';
			default:
				return 'red';
		}
	}
</script>

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

{#if value.length > 0 && showPasswordStrength}
	<div class="mt-2">
		<div
			class="password-strength-bar"
			style="background-color: {strengthColor}; width: {passwordStrength * 25}%; height: 5px;"
		></div>
		<p class="text-gray-500">{strengthText}</p>
	</div>
{/if}
