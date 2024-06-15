<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

    import { goto} from "$app/navigation";
    import { onMount } from 'svelte';

	import { Turnstile } from 'svelte-turnstile';
	import { CLOUDFLARE_SITE_KEY } from '$lib/const';
	import { getUserAuthenticationCSRFToken } from '$lib/services/csrfTokenFetcher/getUserAuthenticationCSRFToken';
	import { verifyEmail } from '$lib/services/emailVerification/verifyEmail';
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
	import { getSessionCookie } from '$lib/cookies/sessionCookie';
	import { requestTotpKey } from '$lib/services/settings/requestTotpKey';
	import { confirmTotpToken } from '$lib/services/settings/confirmTotpToken';
	import delayedNavigate from '$lib/delayedNavigate';

    let phase = 0;

    let isRequestingKey = false;
    let isVerifyingKey = false;

    let totpQrUri = "";
    let totpKey = "";

    /**
	 * @type {string[]}
	 */
    let totpCodes = []

    onMount(() => {
        const username = getUsernameCookie();
        const sessionToken = getSessionCookie();

        if (!username || !sessionToken) {
            toastStore.trigger({
                message: 'Your session may have expired! Please login again!',
                timeout: 5000,
                background: 'variant-filled-warning',
            });
            goto('/login');
            return
        }
    });

    let confirmTotpInput = "";
    function triggerConfirmTotp() {
        if (confirmTotpInput.trim().length != 6) {
            toastStore.trigger({
                message: 'Invalid TOTP code, please try again!',
                timeout: 3000,
                background: 'variant-filled-warning',
            });
            return
        }

        isVerifyingKey = true;
        confirmTotpToken(confirmTotpInput.trim()).then((data) => {
            isVerifyingKey = false;
            if (data.status == "SUCCESS") {
                toastStore.trigger({
                    message: 'Successfully enabled TOTP!',
                    timeout: 5000,
                    background: 'variant-filled-success',
                });
                phase = 2;
                totpCodes = data.codes
                return;
            }

            if (data.status == "INVALID_CODE") {
                toastStore.trigger({
                    message: 'Invalid TOTP code, please try again!',
                    timeout: 3000,
                    background: 'variant-filled-warning',
                });
                return;
            }
            
            toastStore.trigger({
                message: 'Failed to verify TOTP code, please try again! Contact admin if persists!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
        })
    }

    function triggerGetTotpKey() {
        isRequestingKey = true;
        requestTotpKey().then((data) => {
            isRequestingKey = false;
            if (data.status == "SUCCESS") {
                toastStore.trigger({
                    message: 'Successfully requested TOTP key!',
                    timeout: 5000,
                    background: 'variant-filled-success',
                });
                totpKey = data.secret;
                totpQrUri = data.qrCodeUri;
                phase = 1;
                return;
            }

            if (data.status == "ALREADY_ENABLED") {
                toastStore.trigger({
                    message: 'You already have TOTP enabled!',
                    timeout: 5000,
                    background: 'variant-filled-error',
                });
                return;
            }
            
            toastStore.trigger({
                message: 'Failed to request TOTP key, please try again!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
        })
    }

</script>


<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
        {#if phase == 0}
            <button on:click={triggerGetTotpKey} disabled={isRequestingKey} class="btn variant-filled">Request TOTP Key</button>
        {:else if phase == 1}
            <img src="{totpQrUri}" alt="TOTP QR Code" />
            <blockquote class="blockquote">
                No QR Code Scanner? Enter this code instead: 
                <code class="code">{totpKey}</code>
            </blockquote>
            <br>

            <p>Enter the current TOTP code to confirm</p>
            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                <input type="text" bind:value={confirmTotpInput} placeholder="TOTP Code" />
                <button class="variant-filled-secondary" on:click={triggerConfirmTotp} disabled={isVerifyingKey}>Confirm</button>
            </div>
        {:else if phase == 2}
            <h2 class="h2">Recovery Codes</h2>
            <p>Save these Recovery Codes, as they are shown only once.</p>
            <p>Keep them in a safe place. They can be used if you ever lost your TOTP key.</p>
            <br>
            <div class="logo-cloud grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-0.5">
                {#each totpCodes as code, i}
                    <p>{code}</p>
                {/each}
            </div>
            <br>
            <button type="button" class="btn variant-ghost-warning" on:click={() => delayedNavigate('/settings', 50)}>I have stored them!</button>
        {/if}
    </div>
</div>