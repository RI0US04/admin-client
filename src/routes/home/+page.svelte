<script>

    import { getToastStore, getModalStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()
    const modalStore = getModalStore();

    import { onMount } from 'svelte';
	import { getSessionCookie } from '$lib/cookies/sessionCookie';
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
	import delayedNavigate from '$lib/delayedNavigate';
	import { getUserInformation } from '$lib/services/settings/getUserInformation';

    let username = '';
    let email = '';
    let totpEnabled = false;
    let createdAt = '';

    /**
	 * @type {any[]}
	 */
    let existingSessions = []

    onMount(() => {
        const sessionToken = getSessionCookie()
        username = getUsernameCookie()

        if (sessionToken === undefined || username === undefined) {
            const t = {
                message: 'Your session may have expired, please login again!',
                timeout: 3250,
                background: 'variant-filled-warning'
            };
            toastStore.trigger(t);

            delayedNavigate('/login')
            return
        }

        
        getUserInformation(username, sessionToken).then((data) => {
            if (data.status !== 'SUCCESS') {
                const t = {
                    message: 'Unknown error, try again or contact admin if persists!',
                    timeout: 4250,
                    background: 'variant-filled-error'
                };
                toastStore.trigger(t);
                return
            }

            console.debug(`Succesfully fetched user information :: ${JSON.stringify(data)}`)
            existingSessions = data.sessions;
            email = data.userData.email;
            totpEnabled = data.userData.totpEnabled;
            createdAt = data.userData.createdAt;
        });
        
    })

</script>

<div class="container h-full mx-auto justify-center items-center">
	<div class="space-y-10 text-center items-center">
        <br>
        <h2 class="h2">Welcome back, {username}!</h2>

    </div>
</div>