<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

    import { onMount } from 'svelte';

	import { Turnstile } from 'svelte-turnstile';
	import { CLOUDFLARE_SITE_KEY } from '$lib/const';
	import { getUserAuthenticationCSRFToken } from '$lib/services/csrfTokenFetcher/getUserAuthenticationCSRFToken';
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
	import { disableTotp } from '$lib/services/settings/disableTotp';
	import delayedNavigate from '$lib/delayedNavigate';
 	/**
	 * @type {(() => void) | undefined}
	 */
     let reset;

    let csrfToken = '';
    let loadingAPI = false;

    let usernameInput = '';
    let recoveryCodeInput = '';

    // For requesting new token.

    let turnstileToken = '';
    onMount(() => {
        usernameInput = getUsernameCookie() ?? "";

		getUserAuthenticationCSRFToken()
		.then((token) => {
			csrfToken = token
		}).catch((error) => {
			console.error(`Failed to fetch CRSF Token :: ${error}`)
			// TODO: Display error to the user...
		})
    });

    function triggerDisableTotp() {
        if (!usernameInput || !recoveryCodeInput) {
            console.warn('There is still errors or blank fields, yet user invoked login function!');
            const t = toastStore.trigger({
                message: 'Fill in all the fields!',
                timeout: 3000,
                background: 'variant-filled-warning',
            })
            return;
        }

        if (!turnstileToken) {
            const t = toastStore.trigger({
                message: 'Complete the captcha!',
                timeout: 3000,
                background: 'variant-filled-warning',
            })
            return;
        }

        loadingAPI = true;
        disableTotp(usernameInput, recoveryCodeInput, turnstileToken, csrfToken).then((data) => {
            loadingAPI = false;
            reset?.();

            if (data.status == "SUCCESS") {
                toastStore.trigger({
                    message: 'Successfully disabled TOTP!',
                    timeout: 3000,
                    background: 'variant-filled-success',
                })
                delayedNavigate('/login');
                return;
            }

            if (data.status == "TOO_MANY_TRIES") {
                toastStore.trigger({
                    message: 'You have tried too many times! Try again in 5 minutes.',
                    timeout: 5000,
                    background: 'variant-filled-warning',
                });
                return;
            }

            if (data.status == "BAD_USERNAME") {
                toastStore.trigger({
                    message: 'Username not found!',
                    timeout: 3000,
                    background: 'variant-filled-warning',
                });
                return;
            }

            if (data.status == "INVALID_CODE") {
                toastStore.trigger({
                    message: 'Invalid Recovery Code!',
                    timeout: 3000,
                    background: 'variant-filled-warning',
                });
                return;
            }

            toastStore.trigger({
                message: 'Failed to disable TOTP, please try again! Contact admin if persists!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
        })
    }

    /**
     * @param {any} result
    */
	function onTurnstileCallbackjs(result) {
		turnstileToken = result.detail.token
	}
</script>


<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">

        <label class="label">
            <span>Username</span>
            <input class="input" bind:value={usernameInput} type="text" placeholder="Username..." />
        </label>

        <label class="label">
            <span>Recovery Code</span>
            <input class="input" bind:value={recoveryCodeInput} type="text" placeholder="Any one of the recovery code here..." />
        </label>

        <button type="button" disabled={loadingAPI} on:click={triggerDisableTotp} class="btn variant-filled-warning">Disable TOTP</button>

        <Turnstile
            bind:reset
            siteKey={CLOUDFLARE_SITE_KEY}
            on:turnstile-callback={onTurnstileCallbackjs}
        />
    </div>
</div>