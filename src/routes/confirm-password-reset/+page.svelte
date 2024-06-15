<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

    import { onMount } from 'svelte';

	import PasswordInput from '../../routes/register/passwordInput.svelte';
	import { Turnstile } from 'svelte-turnstile';
	import { CLOUDFLARE_SITE_KEY } from '$lib/const';
	import { getUserAuthenticationCSRFToken } from '$lib/services/csrfTokenFetcher/getUserAuthenticationCSRFToken';
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
	import { resetPassword } from '$lib/services/passwordReset/resetPassword';
	import { confirmResetPassword } from '$lib/services/passwordReset/confirmResetPassword';
	import delayedNavigate from '$lib/delayedNavigate';
 	/**
	 * @type {(() => void) | undefined}
	 */
     let reset;

    let csrfToken = '';
    let loadingAPI = false;
    let code = '';
    let id = '';

    let turnstileToken = '';
    let passwordInput = '';
    let passwordInputError = '';

    onMount(() => {
        const hash = window.location.hash.slice(1); // Remove the leading #
        const params = new URLSearchParams(hash);

        code = params.get('code') ?? "";
        id = params.get('id') ?? "";

        if (!code || !id) {
            toastStore.trigger({
                message: 'Failed to authenticate. Please try again, or request for new token!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
        }
        console.debug(`Code :: ${code} | ID :: ${id}`)

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

    function requestConfirmReset(){
        loadingAPI = true;
        confirmResetPassword(id, code, passwordInput, turnstileToken, csrfToken).then((data) => {
            loadingAPI = false;
            console.debug("Confirm Password Reset ::", data)

            if (data.status == "SUCCESS") {
                toastStore.trigger({
                    message: 'Reset successful! Login now.',
                    timeout: 5000,
                    background: 'variant-filled-success',
                });
                delayedNavigate('/login', 1000);
                return;
            }
            reset?.();

            if (data.status == "COMMON_PASSWORD") {
                passwordInputError = "Password is too commonly used!";
                return;
            }

            if (data.status == "INVALID_TOKEN") {
                toastStore.trigger({
                    message: 'Invalid reset token! Request reset again?',
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

    $: canRequest = passwordInputError.length <= 0;
</script>


<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">

        <h6 class="h6 mt-3">New Password</h6>
        <PasswordInput bind:value={passwordInput} bind:error={passwordInputError}/>

        <button type="button" on:click={requestConfirmReset} disabled={loadingAPI || !canRequest} class="btn variant-filled-success">Reset!</button>

        <Turnstile
            bind:reset
            siteKey={CLOUDFLARE_SITE_KEY}
            on:turnstile-callback={onTurnstileCallbackjs}
        />
    </div>
</div>