<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

    import { onMount } from 'svelte';

	import { Turnstile } from 'svelte-turnstile';
	import { CLOUDFLARE_SITE_KEY } from '$lib/const';
	import { getUserAuthenticationCSRFToken } from '$lib/services/csrfTokenFetcher/getUserAuthenticationCSRFToken';
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
	import { resetPassword } from '$lib/services/passwordReset/resetPassword';
 	/**
	 * @type {(() => void) | undefined}
	 */
     let reset;

    let csrfToken = '';
    let loadingAPI = false;

    let usernameInput = '';

    // For requesting new token.

    let turnstileToken = '';
    onMount(() => {
        usernameInput = getUsernameCookie();

		getUserAuthenticationCSRFToken()
		.then((token) => {
			csrfToken = token
		}).catch((error) => {
			console.error(`Failed to fetch CRSF Token :: ${error}`)
			// TODO: Display error to the user...
		})
    });
    /**
     * @param {any} result
    */
	function onTurnstileCallbackjs(result) {
		turnstileToken = result.detail.token
	}

    function requestResetPasswordEmail(){
        loadingAPI = true;
        resetPassword(usernameInput, turnstileToken, csrfToken).then((data) => {
            loadingAPI = false;

            if (data.status == "SUCCESS") {
                toastStore.trigger({
                    message: 'Request successful! Please check your email.',
                    timeout: 5000,
                    background: 'variant-filled-success',
                });
                return;
            }
            reset?.();

            if (data.status == "WAIT_BEFORE_SENDING") {
                toastStore.trigger({
                    message: 'Too many attempts made in a short period! Try again later!',
                    timeout: 10000,
                    background: 'variant-filled-warning',
                });
                return;
            }

            if (data.status == "NOT_AUTHENTICATED") {
                toastStore.trigger({
                    message: 'Authenticate your email first!',
                    timeout: 5000,
                    background: 'variant-filled-error',
                });
                return;
            }

            toastStore.trigger({
                message: 'Failed to send email. Please try again later or contact admin if persists!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
            return;
        })
    }
</script>


<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">

        <label class="label">
            <span>Username</span>
            <input class="input" bind:value={usernameInput} type="text" placeholder="Username..." />
        </label>

        <button type="button" on:click={requestResetPasswordEmail} disabled={loadingAPI} class="btn variant-filled-success">Send Reset URL to email</button>

        <Turnstile
            bind:reset
            siteKey={CLOUDFLARE_SITE_KEY}
            on:turnstile-callback={onTurnstileCallbackjs}
        />
    </div>
</div>