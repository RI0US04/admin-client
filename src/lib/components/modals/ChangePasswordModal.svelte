<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import PasswordInput from '../../../routes/register/passwordInput.svelte';
	import { changeUserPassword } from '$lib/services/settings/changeUserPassword';

	import { getToastStore } from '@skeletonlabs/skeleton';
	import { removeSessionCookie } from '$lib/cookies/sessionCookie';
	import { removeUsernameCookie } from '$lib/cookies/usernameCookie';
	import delayedNavigate from '$lib/delayedNavigate';
	const toastStore = getToastStore();

	// Props
	/** Exposes parent props to this component. */
	export let parent;

	const modalStore = getModalStore();

	let totpenabled = false;
	let oldPasswordError = '';
	let newPasswordError = '';

	// Form Data
	let oldPassword = ''
	let	newPassword = ''
	let	totpCode = ''

	let totpError = '';

	let isLoadingAPI = false;

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit() {
        totpError = ""

		isLoadingAPI = true;
		changeUserPassword(oldPassword, newPassword, totpCode).then((data) => {
			isLoadingAPI = false;
			if (data.status === 'BAD_CURRENT_PASSWORD') {
				newPasswordError = 'Incorrect password';
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
				message: 'Password changed successfully! Please login again!',
				timeout: 5000,
				background: 'variant-filled-success'
			};
			toastStore.trigger(t);
			removeSessionCookie();
			removeUsernameCookie();
			delayedNavigate('/login');
			modalStore.close();
		})
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

	$: buttonDisabled =
		newPasswordError.length !== 0 ||
		oldPasswordError.length !== 0
</script>

<!-- @component This example creates a simple form modal. -->
{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>Change Password</header>
		
		<form class="modal-form {cForm}">
			<h6 class="h6 mt-3">Old Password</h6>
			<PasswordInput showPasswordStrength={false} bind:value={oldPassword} bind:error={oldPasswordError}/>

			<h6 class="h6 mt-3">New Password</h6>
			<PasswordInput bind:value={newPassword} bind:error={newPasswordError}/>

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
			<button class="btn {parent.buttonPositive}" disabled={buttonDisabled || isLoadingAPI} on:click={onFormSubmit}>Change Password</button>
		</footer>
	</div>
{/if}