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

    let authenticated = false;
    let deactivated = false;

    /**
	 * @type {any[]}
	 */
     let accessAttributes = []

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
            accessAttributes = data.accessAttributes;
            deactivated = data.userData.deactivated;
            authenticated = data.userData.authenticated;
        });
        
    })

    $: totpWarning = totpEnabled ? "text-primary-500" : "text-warning-500";

    import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
    let valueSingle = "home";

    function routeTo(route ="/home") {
        delayedNavigate(route, 20)
    }

    /**
	 * @param {string} targetAccess
	 */
    function hasAccessTo(targetAccess) {
        const found = accessAttributes.find(element => element.access === targetAccess);
        if (found == null) {
            return false;
        }

        if (found.totpRequired) {
            return totpEnabled;
        }
    }

    $: globalListBoxTextClass = authenticated && !deactivated ? "text-success-500" : "text-error-500";
    $: listBoxTextClass =  authenticated && !deactivated ? (totpEnabled ? "text-success-500" : "text-warning-500") : "text-error-500";
</script>

<div class="container h-full mx-auto justify-center items-center">
	<div class="space-y-10 text-center items-center">
        <br>
        <h2 class="h2">Welcome back, {username}!</h2>

        <h4 class="h4">Action Panels</h4>
        <div class="card p-4">
            <ListBox>
                <ListBoxItem bind:group={valueSingle} name="medium" value="home">Home</ListBoxItem>
                <ListBoxItem bind:group={valueSingle} on:click={() => routeTo("/settings")} name="medium" value="movies">Account Settings</ListBoxItem>
                <ListBoxItem class={globalListBoxTextClass} disabled={deactivated || !authenticated} bind:group={valueSingle} on:click={() => routeTo("/logs")} name="medium" value="logs">View Logs</ListBoxItem>
                <ListBoxItem class={globalListBoxTextClass} disabled={deactivated || !authenticated} bind:group={valueSingle} on:click={() => routeTo("/manage-users")} name="medium" value="users">Manage Users</ListBoxItem>
                <ListBoxItem class={listBoxTextClass} disabled={!totpEnabled || deactivated || !authenticated} bind:group={valueSingle} on:click={() => routeTo("/manage-admins")} name="medium" value="admin">Manage Admins</ListBoxItem>
                <ListBoxItem class={!hasAccessTo("CREATE_ADMIN_ACCOUNT") ? "text-error-500" : listBoxTextClass} disabled={!hasAccessTo("CREATE_ADMIN_ACCOUNT") || deactivated || !authenticated} bind:group={valueSingle} on:click={() => routeTo("/register-admin")} name="medium" value="register-admin">Register new admin</ListBoxItem>
            </ListBox>
        </div>

        <hr>

        {#if !deactivated}
            <p class="text-success-500">Account status is OK!</p>
        {:else}
            <div>
                <p class="text-error-500">This account is deactivated!</p>
                <p class="text-warning-500">Contact higher admin for information.</p>
            </div>
        {/if}

        {#if authenticated}
            <p class="text-success-500">Account is authenticated!</p>
        {:else}
            <div>
                <p class="text-error-500">Account is not authenticated!</p>
                <p class="text-warning-500">Change password in settings to get authenticated!</p>
            </div>
        {/if}

        {#if totpEnabled}
            <p class="text-success-500">You have TOTP enabled!</p>
        {:else}
            <div>
                <p class="text-warning-500">You do not have TOTP Enabled!</p>
                <p class="text-warning-500">Some actions cannot be performed unless you enable TOTP!</p>
            </div>
        {/if}

        <h4 class="h4">Your Access Privileges</h4>
        <div class="table-container">
            <!-- Native Table Element -->
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>TOTP Required</th>
                    </tr>
                </thead>
                <tbody>
                    {#each accessAttributes as row}
                        <tr>
                            {#if row.totpRequired}
                                <td class={totpWarning}>{row.access}</td>
                            {:else}
                                <td>{row.access}</td>
                            {/if}
                            {#if row.totpRequired}
                                <td class={totpWarning}>Yes</td>
                            {:else}
                                <td>No</td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <br>
    </div>
</div>