<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

    import { onMount } from 'svelte';

	import { verifyChangeEmail } from '$lib/services/emailVerification/verifyChangeEmail';
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
	import { getSessionCookie } from '$lib/cookies/sessionCookie';
	import delayedNavigate from '$lib/delayedNavigate';

    let code = '';
    let id = '';

    let loadingAPI = false;

    onMount(() => {
        const hash = window.location.hash.slice(1); // Remove the leading #
        const params = new URLSearchParams(hash);

        code = params.get('code') ?? "";
        id = params.get('id') ?? "";

        if (!code || !id) {
            toastStore.trigger({
                message: 'Failed to validate. Please try again, or request for new email change!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
        }
        console.debug(`Code :: ${code} | ID :: ${id}`)

        const username = getUsernameCookie();
        const sessionToken = getSessionCookie();

        if (!username || !sessionToken) {
            toastStore.trigger({
                message: 'Please login first before confirming!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
            delayedNavigate('/login');
            return
        }
    });

    function validateToken() {
        if (!code || !id) {
            console.warn('There is still errors or blank fields, yet user invoked login function!');
            return;
        }

        loadingAPI = true;
        verifyChangeEmail(id, code).then((data) => {
            loadingAPI = false;
            if (data.status == "SUCCESS") {
                toastStore.trigger({
                    message: 'Email change successful!',
                    timeout: 5000,
                    background: 'variant-filled-success',
                });

				setTimeout(() => {
					window.location.href = '/settings';
				}, 2700);
                loadingAPI = true;
                return;
            }

            if (data.status == "BAD_SESSION_TOKEN") {
                toastStore.trigger({
                    message: 'Please login first before confirming!',
                    timeout: 5000,
                    background: 'variant-filled-warning',
                });
                delayedNavigate('/login');
                return;
            }

            if (data.status == "EMAIL_TAKEN") {
                toastStore.trigger({
                    message: 'Apparently the email is already taken!',
                    timeout: 10000,
                    background: 'variant-filled-error',
                });
                delayedNavigate('/settings', 4000);
                loadingAPI = true;
                return;
            }

            toastStore.trigger({
                message: 'Failed to authenticate. Please try again, or request for new token!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
        })
    }
</script>


<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
        <button type="button" disabled={loadingAPI} on:click={validateToken} class="btn variant-filled">Click me to confirm email change!</button>
    </div>
</div>