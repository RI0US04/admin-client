<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

	import { Stretch } from 'svelte-loading-spinners';
    import { onMount } from 'svelte';

	onMount(() => {
		const existingSession = getSessionCookie();
		if (!existingSession) {
            toastStore.trigger({
                message: 'Please login first!',
                timeout: 5000,
                background: 'variant-filled-error',
            })
			delayedNavigate('/login', 1750)
            return;
		}
	});

	let username = '';
	let usernameError = '';

	let email = '';
	let emailError = '';
	let emailShowLoginInstead = false;

	import { getSessionCookie } from '$lib/cookies/sessionCookie';
	import UsernameInput from '../register/usernameInput.svelte';
	import EmailInput from '../register/emailInput.svelte';
	import PasswordInput from '../register/passwordInput.svelte';
	import delayedNavigate from '$lib/delayedNavigate';
	import { registerAdmin } from '$lib/services/adminManagement/registerAdmin';
	let password = '';
	let passwordError = '';

	let genericError = '';

	$: loadingAPI = false;

	async function register() {
		genericError = '';
		if (
			usernameError.length !== 0 ||
			emailError.length !== 0 ||
			passwordError.length !== 0 ||
			username.length === 0 ||
			email.length === 0 ||
			password.length === 0
		) {
			console.warn('There is still errors or blank fields, yet user invoked regisration function!');
			return;
		}

		try {
			loadingAPI = true;

            const result = await registerAdmin(username, password, email);
			if (result.status === 'SUCCESS') {
                toastStore.trigger({
                    message: 'Registration successful! Let the other admin know!',
                    timeout: 5000,
                    background: 'variant-filled-success',
                })
            } else if (result.status === 'USERNAME_TAKEN') {
				usernameError = 'The username has been taken!';
			} else if (result.status === 'EMAIL_TAKEN') {
				emailError = 'The email has been used! Forgot password?';
			} else if (result.status === 'COMMON_PASSWORD') {
				passwordError = 'The password is too common!';
			} else if (result.status === 'INVALID_CLOUDFLARE_TOKEN') {
				genericError = 'Please complete the cloudflare captcha! Or refresh the page and try again!';
			} else if (result.status === "ACCOUNT_NOT_2FA_ENABLED") {
                genericError = "Please enable TOTP on your account to perform this action!"
                toastStore.trigger({
                    message: 'Please enable TOTP on your account to perform this action!',
                    timeout: 5000,
                    background: 'variant-filled-error',
                })
            } else if (result.status === "PERMISSION_DENIED") {
                genericError = "You do not have permissions to register an admin!"
                toastStore.trigger({
                    message: 'You do not have permissions to perform this action!',
                    timeout: 5000,
                    background: 'variant-filled-error',
                })
            } else {
				genericError = 'Unknown Error! Refresh page and try again!\nContact admin if issue persists!';
			}
		} catch (error) {
			// @ts-ignore
			console.error(error.message);
			genericError = 'Unknown Error! Refresh page and try again!\nContact admin if issue persists!';
		} finally {
			loadingAPI = false;
		}
	}

	$: registrationDisabled =
		usernameError.length !== 0 ||
		emailError.length !== 0 ||
		passwordError.length !== 0 ||
		username.length === 0 ||
		email.length === 0 ||
		password.length === 0;
</script>

<div class="container h-full mx-auto justify-center items-center">

		<h2 class="h2 m-4">Register a new admin account!</h2>

		<UsernameInput bind:disabled={loadingAPI} bind:error={usernameError} bind:value={username} />
		<p class="text-warning-500">Changing of username is unsupported as of now!</p>

		<h6 class="h6 mt-3">Email</h6>
		<EmailInput
			bind:disabled={loadingAPI}
			bind:showLoginInstead={emailShowLoginInstead}
			bind:error={emailError}
			bind:value={email}
		/>
		<p class="text-warning-500">Initial credentials of this account will be sent to this email address!</p>

		<h6 class="h6 mt-3">Password</h6>
		<PasswordInput bind:disabled={loadingAPI} bind:error={passwordError} bind:value={password} />
		<p class="text-warning-500">The account owner will be forced to change it later.</p>

		{#if loadingAPI}
			<div>
				<Stretch size="60" color="#FF3E00" unit="px" duration="1s" />
			</div>
		{/if}

		<button
			type="button"
			disabled={registrationDisabled || loadingAPI}
			class="mt-3 btn variant-filled"
			on:click={register}
		>
			Register New Admin
		</button>

		<br><br>

		{#if genericError.length !== 0}
			<p class="text-red-500">{genericError}</p>
		{/if}
</div>
