<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

	import { onMount } from 'svelte';
	import { getSessionCookie, setSessionCookie } from '$lib/cookies/sessionCookie';
	import { getUsernameCookie, setUsernameCookie } from '$lib/cookies/usernameCookie';
	import delayedNavigate from '$lib/delayedNavigate';
	import { getLogs } from '$lib/services/getLogs';
	import Datatable from '$lib/components/logTable/Datatable.svelte';
    import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';

    /**
     * @type {any[]}
     */
    let users = [];
    let canSetTokens = false;
    let canRevokeTOTP = false;
    let canRevokeSessions = false;
    let canRevokeVerification = false;
    let canChangeStatus = false;

    let loadingAPI = false;

    async function requestUsers(forceRefresh = false) {
        loadingAPI = true;
        const data = await getUsers(forceRefresh);
        loadingAPI = false;

        const status = data.status;
        if (status === "SUCCESS") {
            users = data.users;
            console.debug("Logs ::", users)

            canSetTokens = data.canSetTokens;
            canRevokeTOTP = data.canRevokeTOTP;
            canRevokeSessions = data.canRevokeSessions;
            canRevokeVerification = data.canRevokeVerification;
            canChangeStatus = data.canChangeStatus;
            return;
        }

        if (status === "ACCOUNT_NOT_AUTHENTICATED") {
            toastStore.trigger({
                message: 'Please authenticate your account by changing your password!',
                timeout: 5000,
                background: 'variant-filled-warning',
            });
            delayedNavigate('/settings', 2500);
            return
        }

        if (status === "RECENTLY_REFRESHED") {
            toastStore.trigger({
                message: 'You refreshed too fast! Wait a few seconds and try again...',
                timeout: 5000,
                background: 'variant-filled-warning',
            });
            return
        }

        toastStore.trigger({
            message: 'An unexpected error occurred!',
            timeout: 3000,
            background: 'variant-filled-error',
        });
    }
    
    onMount(() => {
        const username = getUsernameCookie();
        const sessionToken = getSessionCookie();

        if (!username || !sessionToken) {
            toastStore.trigger({
                message: 'Your session may have expired! Please login again!',
                timeout: 3000,
                background: 'variant-filled-warning',
            });
            delayedNavigate('/login');
            return
        }

        requestUsers();
    });

	//Import local datatable components
	import ThSort from '$lib/components/logTable/ThSort.svelte';
	import ThFilter from '$lib/components/logTable/ThFilter.svelte';
	import Search from '$lib/components/logTable/Search.svelte';
	import RowsPerPage from '$lib/components/logTable/RowsPerPage.svelte';
	import RowCount from '$lib/components/logTable/RowCount.svelte';
	import Pagination from '$lib/components/logTable/Pagination.svelte';

    /**
     * @type {any[]}
     */
	import { DataHandler } from '@vincjo/datatables';
	import { getUsers } from '$lib/services/userManagement/getUsers';
	import { changeUserStatus } from '$lib/services/userManagement/changeUserStatus';
	import { revokeUserTOTP } from '$lib/services/userManagement/revokeUserTotp';
	import { revokeUserVerification } from '$lib/services/userManagement/revokeUserVerification';

	$: handler = new DataHandler(users, { rowsPerPage: 50 });
	$: rows = handler.getRows();

    /**
	 * @param {string} userID
	 * @param {string} status
	 */
    async function triggerChangeUserStatus(userID, status) {
        console.debug("Change User Status ::", userID, status)
        loadingAPI = true;
        const data = await changeUserStatus(userID, status);
        loadingAPI = false;

        const responseStatus = data.status;
        if (responseStatus !== "SUCCESS") {
            toastStore.trigger({
                message: 'An unexpected error occurred!',
                timeout: 3000,
                background: 'variant-filled-error',
            });
            return;
        }

        const index = users.findIndex(user => user.id === userID);

        if (index >= 0) {
            users[index] = { ...users[index], status: status };
        }

        toastStore.trigger({
            message: 'User status changed successfully!',
            timeout: 3000,
            background: 'variant-filled-success',
        });
    }

        /**
	 * @param {string} userID
	 */
     async function triggerDisableVerification(userID) {
        loadingAPI = true;
        const data = await revokeUserVerification(userID);
        loadingAPI = false;

        const responseStatus = data.status;
         if (responseStatus !== "SUCCESS" && responseStatus !== "USER_NOT_AUTHENTICATED") {
            toastStore.trigger({
                message: 'An unexpected error occurred!',
                timeout: 3000,
                background: 'variant-filled-error',
            });
            return;
        }

        const index = users.findIndex(user => user.id === userID);

        if (index >= 0) {
            users[index] = { ...users[index], totpEnabled: false };
        }

        if (responseStatus === "USER_NOT_AUTHENTICATED") {
            toastStore.trigger({
                message: 'User is not yet verified!',
                timeout: 3000,
                background: 'variant-filled-warning',
            });
            return;
        }

        toastStore.trigger({
            message: 'TOTP disabled changed successfully!',
            timeout: 3000,
            background: 'variant-filled-success',
        });
    }

    /**
	 * @param {string} userID
	 */
    async function triggerDisableTOTP(userID) {
        loadingAPI = true;
        const data = await revokeUserTOTP(userID);
        loadingAPI = false;

        const responseStatus = data.status;
         if (responseStatus !== "SUCCESS" && responseStatus !== "USER_NOT_TOTP_ENABLED") {
            toastStore.trigger({
                message: 'An unexpected error occurred!',
                timeout: 3000,
                background: 'variant-filled-error',
            });
            return;
        }

        const index = users.findIndex(user => user.id === userID);

        if (index >= 0) {
            users[index] = { ...users[index], totpEnabled: false };
        }

        if (responseStatus === "USER_NOT_TOTP_ENABLED") {
            toastStore.trigger({
                message: 'User TOTP is already disabed!',
                timeout: 3000,
                background: 'variant-filled-warning',
            });
            return;
        }

        toastStore.trigger({
            message: 'TOTP disabled changed successfully!',
            timeout: 3000,
            background: 'variant-filled-success',
        });
    }
</script>

<div class="container h-full mx-auto">
	<div class="space-y-10">
        <br>
        <h2 class="h2">List automatically updates every 5 minutes.</h2>
        <button type="button" on:click={() => requestUsers(true)} disabled={loadingAPI} class="btn variant-filled-warning">Force Refresh</button>
        <div class=" overflow-x-auto space-y-4">
            <!-- Header -->
            <header class="flex justify-between gap-4">
                <Search {handler} />
                <RowsPerPage {handler} />
            </header>
            <!-- Table -->
            <table class="table table-hover table-compact w-full table-auto">
                <thead>
                    <tr>
                        <ThSort {handler} orderBy="id">ID</ThSort>
                        <ThSort {handler} orderBy="username">Username</ThSort>
                        <ThSort {handler} orderBy="email">Email</ThSort>
                        <ThSort {handler} orderBy="status">Status</ThSort>
                        <ThSort {handler} orderBy="authenticated">Email Verified</ThSort>
                        <ThSort {handler} orderBy="totpEnabled">TOTP Enabled</ThSort>
                        <ThSort {handler} orderBy="token">Token Count</ThSort>
                        <ThSort {handler} orderBy="createdAt">Created At</ThSort>
                    </tr>
                    <tr>
                        <ThFilter {handler} filterBy="id" />
                        <ThFilter {handler} filterBy="username" />
                        <ThFilter {handler} filterBy="email" />
                        <ThFilter {handler} filterBy="status" />
                        <ThFilter {handler} filterBy="authenticated" />
                        <ThFilter {handler} filterBy="totpEnabled" />
                        <ThFilter {handler} filterBy="token" />
                        <ThFilter {handler} filterBy="createdAt" />
                    </tr>
                </thead>
                <tbody>
                    {#each $rows as row}
                        <tr>
                            <td>{row.id}</td>
                            <td>{row.username}</td>
                            <td>{row.email}</td>

                            <!--Status-->
                            {#if canChangeStatus}
                                <td>
                                    <select disabled={loadingAPI} on:change={(e) => triggerChangeUserStatus(row.id, e.target.value)} class="select" value={row.status}>
                                        <option value="OK">Ok</option>
                                        <option value="LOCKED">Locked</option>
                                        <option value="BANNED">Banned</option>
                                    </select>
                                </td>
                            {:else}
                                <td>{row.status}</td>
                            {/if}

                            <!--Email Verification-->
                            {#if canRevokeVerification}
                                <td>
                                    {#if row.authenticated}
                                        <button type="button" on:click={() => triggerDisableVerification(row.id)} disabled={loadingAPI} class="btn variant-filled-warning">Revoke Verification</button>
                                    {:else}
                                        <button type="button" disabled={true} class="btn variant-filled">Not Verified</button>
                                    {/if}
                                </td>
                            {:else}
                                <td>{row.authenticated}</td>
                            {/if}
                            
                            <!--TOTP-->
                            {#if canRevokeTOTP}
                                <td>
                                    {#if row.totpEnabled}
                                        <button type="button" on:click={() => triggerDisableTOTP(row.id)} disabled={loadingAPI} class="btn variant-filled-warning">Revoke TOTP</button>
                                    {:else}
                                        <button type="button" disabled={true} class="btn variant-filled">TOTP Disabled</button>
                                    {/if}
                                </td>
                            {:else}
                                <td>{row.totpEnabled}</td>
                            {/if}

                            <td>{row.token}</td>
                            <td>{new Date(row.createdAt)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            <!-- Footer -->
            <footer class="flex justify-between">
                <RowCount {handler} />
                <Pagination {handler} />
            </footer>
        </div>

        <br>
    </div>
</div>