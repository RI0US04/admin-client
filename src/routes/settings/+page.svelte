<script>

    import { getToastStore, getModalStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()
    const modalStore = getModalStore();

    import { onMount } from 'svelte';
	import { getSessionCookie, removeSessionCookie, setSessionCookie } from '$lib/cookies/sessionCookie';
	import { getUsernameCookie, removeUsernameCookie, setUsernameCookie } from '$lib/cookies/usernameCookie';
	import delayedNavigate from '$lib/delayedNavigate';
	import { getUserInformation } from '$lib/services/settings/getUserInformation';
	import ChangePasswordModal from '$lib/components/modals/ChangePasswordModal.svelte';
	import ChangeEmailModal from '$lib/components/modals/ChangeEmailModal.svelte';
	import { revokeSessionToken } from '$lib/services/settings/revokeSessionToken';

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

    function triggerChangePassword(){
        const modal = {
            ref: ChangePasswordModal,
            type: 'component',
            component: 'changePasswordModal',
        };
        // @ts-ignore
        modalStore.trigger(modal);
    }

    function triggerChangeEmail(){
        const modal = {
            ref: ChangeEmailModal,
            type: 'component',
            component: 'changeEmailModal',
        };
        // @ts-ignore
        modalStore.trigger(modal);
    }

    let loadingRevokeAPI = false;

    /**
     * 
     * @param {number} sessionID
     */
    function revokeSession(sessionID) {
        loadingRevokeAPI = true;
        revokeSessionToken(sessionID).then((data) => {
            loadingRevokeAPI = false;
            if (data.status == "SUCCESS") {
                toastStore.trigger({
                    message: 'Successfully revoked session!',
                    timeout: 5000,
                    background: 'variant-filled-success',
                });

                existingSessions = existingSessions.filter(session => session.id !== sessionID);
                return
            }

            if (data.status == "BAD_SESSION_TOKEN") {
                toastStore.trigger({
                    message: 'Your session expired! Please login again!',
                    timeout: 4000,
                    background: 'variant-filled-warning',
                });
                delayedNavigate('/login')
                return
            }

            toastStore.trigger({
                message: 'Failed to revoke session, please try again! Or contact admin if persists!',
                timeout: 5000,
                background: 'variant-filled-error',
            });
        })
    }

    function gobackChat() {
        delayedNavigate('/home', 50)
    }
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">

        <br>
        <button type="button" on:click={gobackChat} class="btn-sm variant-ghost">{"<-"} Back</button>

        <h2 class="h2">Settings</h2>

        <label class="label">
            <span>Username</span>
            <input class="input" bind:value={username} disabled={true} type="text" placeholder="Username of your account" />
            <i class="text-error-500">(Username cannot be changed)</i>
        </label>

        <label class="label">
            <span>Email</span>
            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                <input type="email" placeholder="New Email" disabled={true} bind:value={email}/>
                <button class="variant-filled-secondary" on:click={triggerChangeEmail}>Change</button>
            </div>
        </label>

        <button type="button" class="btn variant-filled" on:click={triggerChangePassword}>Change Password</button>

        <br>
        <div class="mt-2">
            <i>
                Forgot password? <a class="anchor" href="/reset-password">reset</a> .
            </i>
        </div>

        {#if !totpEnabled}
            <button type="button" class="btn variant-filled-success" on:click={() => delayedNavigate('/settings/setup-totp', 50)}>Enable TOTP</button>
        {:else}
            <button type="button" class="btn variant-filled-warning" on:click={() => delayedNavigate('/disable-totp', 50)}>Disable TOTP</button>
        {/if}

        <h4 class="h4">Sessions</h4>
        <!-- Responsive Container (recommended) -->
        <div class="table-container">
            <!-- Native Table Element -->
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Country</th>
                        <th>Client Information</th>
                        <th>Logged in At</th>
                        <th>Revoke Sessions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each existingSessions as row, i}
                        <tr>
                            <td>{row.id} {row.isSelfSession ? "(You)" : ""}</td>
                            <td>{row.country}</td>
                            <td>{row.clientInfo}</td>
                            <td>{new Date(row.createdAt).toDateString()}</td>
                            <td>
                                <button type="button" disabled={row.isSelfSession || loadingRevokeAPI} class="btn-sm" on:click={() => revokeSession(row.id)}>
                                    <p class={row.isSelfSession ? "" : "anchor"}>
                                        Revoke
                                    </p>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <br>

    </div>
</div>