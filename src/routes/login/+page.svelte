<script>
	import { Toast, getToastStore } from '@skeletonlabs/skeleton';
	import { Stretch } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import { getUserAuthenticationCSRFToken } from '$lib/services/csrfTokenFetcher/getUserAuthenticationCSRFToken';

	import { Turnstile } from 'svelte-turnstile';

	/**
	 * @type {(() => void) | undefined}
	 */
	let reset;

	const toastStore = getToastStore();
	// Store for CSRF token
	let csrfToken = '';
	onMount(() => {
		const existingSession = getSessionCookie();
		if (existingSession) {
			delayedNavigate('/home', 50)
		}

		getUserAuthenticationCSRFToken()
			.then((token) => {
				csrfToken = token;
			})
			.catch((error) => {
				console.error(`Failed to fetch CRSF Token :: ${error}`);
				// TODO: Display error to the user...
			});
	});

	import UsernameInput from './usernameInput.svelte';
	let username = '';
	let usernameError = '';
	let turnstileToken = '';

	let totpRequired = false;
	let totpCode = '';

	import PasswordInput from './passwordInput.svelte';
	import { loginUserAPI } from '$lib/services/authentication/loginUserAPI';
	import { getSessionCookie, setSessionCookie } from '$lib/cookies/sessionCookie';
	import { setUsernameCookie } from '$lib/cookies/usernameCookie';
	import { CLOUDFLARE_SITE_KEY } from '$lib/const';
	import delayedNavigate from '$lib/delayedNavigate';
	let password = '';
	let passwordError = '';

	let genericError = '';

	$: loadingAPI = false;

	async function register() {
		genericError = '';
		if (
			usernameError.length !== 0 ||
			passwordError.length !== 0 ||
			username.length === 0 ||
			password.length === 0
		) {
			console.warn('There is still errors or blank fields, yet user invoked login function!');
			return;
		}

		try {
			const inputUsername = username;
			loadingAPI = true;

			console.debug(`Using token :: ${csrfToken}`);
			const result = await loginUserAPI(username, password, csrfToken, turnstileToken, totpCode);
			console.debug(result);

			if (result.status === 'SUCCESS') {
				setUsernameCookie(inputUsername)
				setSessionCookie(result.token, 30)

				const t = {
					message: 'Successfully logged in! Redirecting to home page...',
					timeout: 2000,
					background: 'variant-filled-success'
				};
				toastStore.trigger(t);

				delayedNavigate('/home')
			} else if (result.status === 'TIMEOUT') {
				const t = {
					message: 'Too many attempts made in a short period! Try again later!',
					timeout: 10000,
					background: 'variant-filled-warning'
				};
				toastStore.trigger(t);
			} else if (result.status === 'BAD_USERNAME') {
				usernameError = "The username doesn't exist!";
			} else if (result.status === 'BAD_PASSWORD') {
				passwordError = 'The password is incorrect!';
			} else if (result.status === 'BANNED') {
				const t = {
					message: 'Sorry, your account was banned.',
					timeout: 10000,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			} else if (result.status === 'LOCKED') {
				const t = {
					message: 'This admin account is disabled...',
					timeout: 10000,
					background: 'variant-filled-warning'
				};
				toastStore.trigger(t);
			} else if (result.status === 'INVALID_CLOUDFLARE_TOKEN') {
				genericError = 'Please complete the cloudflare captcha! Or refresh the page and try again!';
			} else if (result.status === 'NOT_EMAIL_VERIFIED')  {
				genericError = 'Please verify your email!';
			} else if (result.status === 'TOTP_ENABLED') {
				totpRequired = true;
				genericError = "TOTP Enabled account, please complete TOTP!"
			} else if (result.status === 'BAD_TOTP') {
				genericError = "Bad TOTP Code!"
			} else {
				genericError = 'Unknown Error! Refresh page and try again!\nContact admin if issue persists!';
			}

			if (result.status !== 'SUCCESS') {
				reset?.()
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
		passwordError.length !== 0 ||
		username.length === 0 ||
		password.length === 0;

	/**
	 * @param {any} result
	 */
	function onTurnstileCallbackjs(result) {
		console.debug("Cloudflare Token GET ::", result.detail.token)
		turnstileToken = result.detail.token
	}
</script>

<div class="container h-full mx-auto justify-center items-center">
	<h2 class="h2 m-4">Login into an existing account!</h2>

	<UsernameInput bind:disabled={loadingAPI} bind:error={usernameError} bind:value={username} />

	<PasswordInput bind:disabled={loadingAPI} bind:error={passwordError} bind:value={password} />

	{#if totpRequired}
		<h6 class="h6 mt-3">TOTP Code</h6>
		<input class="input" type="text" bind:value={totpCode} placeholder="Enter current TOTP code" />
		<p class="text-warning-500">Account has TOTP Enabled!</p>
	{/if}
	
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
		Login
	</button>

	<br><br>
	<Turnstile
		bind:reset
		siteKey={CLOUDFLARE_SITE_KEY}
		on:turnstile-callback={onTurnstileCallbackjs}
	/>
	
	{#if genericError.length !== 0}
		<p class="text-red-500">{genericError}</p>
	{/if}

	<br>
	<div class="mt-2">
		<i>
			Don't have an account? <a class="anchor" href="/register">Register</a> instead.
		</i>
	</div>
	<br>
	<div class="mt-2">
		<i>
			Forgot password? <a class="anchor" href="/reset-password">reset</a> .
		</i>
	</div>
</div>
