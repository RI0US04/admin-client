<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import PasswordInput from '../../../routes/register/passwordInput.svelte';

	import { getToastStore } from '@skeletonlabs/skeleton';
	import EmailInput from '../../../routes/register/emailInput.svelte';
	import { changeUserEmail } from '$lib/services/settings/changeUserEmail';
	const toastStore = getToastStore();

	// Props
	/** Exposes parent props to this component. */
	export let parent;

	const modalStore = getModalStore();

	let totpenabled = false;
	let passwordError = '';
	let emailError = '';

	// Form Data
	let password = ''
	let	email = ''
	let	totpCode = ''

	let totpError = '';
	let isLoadingAPI = false;

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit() {
        totpError = ""
		isLoadingAPI = true;
		changeUserEmail(password, email, totpCode).then((data) => {
			isLoadingAPI = false;
			if (data.status === 'BAD_CURRENT_PASSWORD') {
				passwordError = 'Incorrect password';
				return
			}

			if (data.status === 'MISSING_TOTP') {
				totpError = 'Please fill in TOTP...';
				totpenabled = true
				return
			}

			if (data.status === 'BAD_TOTP') {
				totpError = 'Invalid TOTP';
				return
			}

			if (data.status !== 'SUCCESS') {
				const t = {
					message: 'Unknown error, try again or contact admin if persists!',
					timeout: 4250,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
				return
			}

			const t = {
				message: 'Check your new email address for change confirmation!',
				timeout: 5250,
				background: 'variant-filled-success'
			};
			toastStore.trigger(t);
			modalStore.close();
		})
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

	$: buttonDisabled =
        emailError.length !== 0 ||
		passwordError.length !== 0
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>Change Email</header>
		
		<form class="modal-form {cForm}">
			<h6 class="h6 mt-3">New Email</h6>
			<EmailInput bind:value={email} bind:error={emailError} showLoginInstead={false}/>

			<h6 class="h6 mt-3">Current Password</h6>
			<PasswordInput showPasswordStrength={false} bind:value={password} bind:error={passwordError}/>

			{#if totpenabled}
				<label class="label">
					<span>TOTP</span>
					<input class="input" type="text" bind:value={totpCode} placeholder="Enter current TOTP code" />
				</label>
			{/if}

			{#if totpError.length !== 0}
				<p class="text-red-500">{totpError}</p>
			{/if}
		</form>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" disabled={isLoadingAPI} on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" disabled={buttonDisabled || isLoadingAPI} on:click={onFormSubmit}>Change Email</button>
		</footer>
	</div>
{/if}