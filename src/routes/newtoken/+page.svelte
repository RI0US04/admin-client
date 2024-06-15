<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

    import { goto} from "$app/navigation";
    import { onMount } from 'svelte';

	import { Turnstile } from 'svelte-turnstile';
	import { CLOUDFLARE_SITE_KEY } from '$lib/const';
	import { getUserAuthenticationCSRFToken } from '$lib/services/csrfTokenFetcher/getUserAuthenticationCSRFToken';
	import { requestEmailVerification } from '$lib/services/emailVerification/requestEmailVerification';

    /**
     * @type {(() => void) | undefined}
     */
    let reset;

    let csrfToken = ''; 
    let username = '';
    let loading = false;

    // For requesting new token.

    let turnstileToken = '';
    onMount(() => {
		getUserAuthenticationCSRFToken()
		.then((token) => {
			csrfToken = token
		}).catch((error) => {
			console.error(`Failed to fetch CRSF Token :: ${error}`)
		})
    });

    function requestNewToken() {
        if (!username || !turnstileToken) {
            console.warn('There is still errors or blank fields, yet user invoked login function!');
            return;
        }
        loading = true;

        requestEmailVerification(username, csrfToken, turnstileToken).then((data) => {
            loading = false;
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

            if (data.status == "ALREADY_AUTHENTICATED") {
                toastStore.trigger({
                    message: 'You are already authenticated!',
                    timeout: 5000,
                    background: 'variant-filled-warning',
                });
                return;
            }

            toastStore.trigger({
                message: 'Failed to request. Please try again!',
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
        <h2 class="h2 mt-9">Request new Authentication Link</h2>
        <label class="label">
            <span>Account Username</span>
            <input class="input" bind:value={username} type="text" placeholder="Username of your account" />
        </label>
        <button type="button" disabled={loading} on:click={requestNewToken} class="btn variant-filled">Request URL</button>

        <Turnstile
            bind:reset
            siteKey={CLOUDFLARE_SITE_KEY}
            on:turnstile-callback={onTurnstileCallbackjs}
        />

    </div>
</div>