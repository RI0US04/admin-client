<script>
    import { getToastStore } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore()

	import { onMount } from 'svelte';
	import { getSessionCookie } from '$lib/cookies/sessionCookie';
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
	import delayedNavigate from '$lib/delayedNavigate';

    let possiblePrivileges = {
        SET_USER_TOKEN: -1,
        CHANGE_USER_STATUS: -2,
        REVOKE_USER_SESSIONS: -3,
        REVOKE_USER_TOTP: -4,
        REVOKE_USER_VERIFICATION_STATUS: -5,
        VIEW_ADMIN_LOGS: -6,
        DEACTIVATE_ADMIN_ACCOUNT: 1,
        CREATE_ADMIN_ACCOUNT: 2,
        CHANGE_ADMIN_ACTIVATION_STATUS: 3,
        MODIFY_ADMIN_ACCESS_ATTRIBUTE: 4,
        REVOKE_ADMIN_SESSIONS: 5,
        REVOKE_ADMIN_2FA: 6,
        REVOKE_ADMIN_VERIFICATION: 7
    }

    /**
     * @type {any[]}
     */
    let admins = [];
    let canSetTokens = false;
    let canRevokeTOTP = false;
    let canRevokeSessions = false;
    let canRevokeVerification = false;
    let canChangeAccess = false;
    let canDeactivateAccount = false;

    let loadingAPI = false;

    async function requestAdminList(forceRefresh = false) {
        loadingAPI = true;
        const data = await getAdmins(forceRefresh);
        loadingAPI = false;

        const status = data.status;
        if (status === "SUCCESS") {
            admins = data.admins;
            console.debug("Logs ::", admins)

            canSetTokens = data.canSetTokens;
            canRevokeTOTP = data.canRevokeTOTP;
            canRevokeSessions = data.canRevokeSessions;
            canRevokeVerification = data.canRevokeVerification;
            canChangeAccess = data.canChangeAccess;
            canDeactivateAccount = data.canDeactivateAccount
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

        requestAdminList();
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
	import { getAdmins } from '$lib/services/adminManagement/getAdmins';
	import { changeAdminStatus } from '$lib/services/adminManagement/changeAdminStatus';
	import { revokeAdminVerification } from '$lib/services/adminManagement/revokeAdminVerification';
	import { revokeAdminTOTP } from '$lib/services/adminManagement/revokeAdminTotp';
	import { toggleAccessAttribute } from '$lib/services/adminManagement/toggleAccessAttribute';

	$: handler = new DataHandler(admins, { rowsPerPage: 50 });
	$: rows = handler.getRows();

    async function triggerToggleAccessControl(userID, privilege) {
        loadingAPI = true;
        const data = await toggleAccessAttribute(userID, privilege);
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

        const index = admins.findIndex(user => user.id === userID);

        if (index >= 0) {
            const admin = admins[index];
            let adminPrivileges = admin.accessAttributes;

            // Check if the integer exists in adminPrivileges
            const indexInPrivileges = adminPrivileges.indexOf(privilege);
            
            if (indexInPrivileges === -1) {
                // If the integer doesn't exist, add it
                adminPrivileges.push(privilege);
            } else {
                // If the integer exists, remove it
                adminPrivileges.splice(indexInPrivileges, 1);
            }

            // Update the admins[index] with the modified accessAttributes
            admins[index] = { ...admin, accessAttributes: adminPrivileges };
        }

        toastStore.trigger({
            message: 'Admin access control changed successfully!',
            timeout: 3000,
            background: 'variant-filled-success',
        });
    }

    /**
	 * @param {string} userID
	 * @param {string} status
	 */
    async function triggerChangeUserStatus(userID, status) {
        console.debug("Change User Status ::", userID, status)
        loadingAPI = true;
        const data = await changeAdminStatus(userID, status);
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

        const index = admins.findIndex(user => user.id === userID);

        if (index >= 0) {
            admins[index] = { ...admins[index], status: status };
        }

        toastStore.trigger({
            message: 'Admin status changed successfully!',
            timeout: 3000,
            background: 'variant-filled-success',
        });
    }

        /**
	 * @param {string} userID
	 */
     async function triggerDisableVerification(userID) {
        loadingAPI = true;
        const data = await revokeAdminVerification(userID);
        loadingAPI = false;

        const responseStatus = data.status;
         if (responseStatus !== "SUCCESS" && responseStatus !== "VERIFICATION_DISABLED") {
            toastStore.trigger({
                message: 'An unexpected error occurred!',
                timeout: 3000,
                background: 'variant-filled-error',
            });
            return;
        }

        const index = admins.findIndex(user => user.id === userID);

        if (index >= 0) {
            admins[index] = { ...admins[index], authenticated: false };
        }

        if (responseStatus === "VERIFICATION_DISABLED") {
            toastStore.trigger({
                message: 'Admin is not yet verified!',
                timeout: 3000,
                background: 'variant-filled-warning',
            });
            return;
        }

        toastStore.trigger({
            message: 'Verification disabled changed successfully!',
            timeout: 3000,
            background: 'variant-filled-success',
        });
    }

    /**
	 * @param {string} userID
	 */
    async function triggerDisableTOTP(userID) {
        loadingAPI = true;
        const data = await revokeAdminTOTP(userID);
        loadingAPI = false;

        const responseStatus = data.status;
         if (responseStatus !== "SUCCESS" && responseStatus !== "TOTP_DISABLED") {
            toastStore.trigger({
                message: 'An unexpected error occurred!',
                timeout: 3000,
                background: 'variant-filled-error',
            });
            return;
        }

        const index = admins.findIndex(user => user.id === userID);

        if (index >= 0) {
            admins[index] = { ...admins[index], totpEnabled: false };
        }

        if (responseStatus === "TOTP_DISABLED") {
            toastStore.trigger({
                message: 'Admin TOTP is already disabed!',
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
	 * @param {any[]} adminPrivileges
	 * @param {any} privilegeValue
	 */
    function hasPrivilege(adminPrivileges, privilegeValue) {
        return adminPrivileges.includes(privilegeValue);
    }
</script>

<div class="container h-full mx-auto">
	<div class="space-y-10">
        <br>
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
                        <ThSort {handler} orderBy="accessAttributes">Access Privileges</ThSort>
                        <ThSort {handler} orderBy="createdAt">Created At</ThSort>
                    </tr>
                    <tr>
                        <ThFilter {handler} filterBy="id" />
                        <ThFilter {handler} filterBy="username" />
                        <ThFilter {handler} filterBy="email" />
                        <ThFilter {handler} filterBy="status" />
                        <ThFilter {handler} filterBy="authenticated" />
                        <ThFilter {handler} filterBy="totpEnabled" />
                        <ThFilter {handler} filterBy="accessAttributes" />
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
                            {#if canDeactivateAccount}
                                <td>
                                    <select disabled={loadingAPI || row.username == getUsernameCookie()} on:change={(e) => triggerChangeUserStatus(row.id, e.target.value)} class="select" value={row.status}>
                                        <option value="OK">Ok</option>
                                        <option value="DEACTIVATED">Deactivated</option>
                                    </select>
                                </td>
                            {:else}
                                <td>{row.status}</td>
                            {/if}

                            <!--Email Verification-->
                            {#if canRevokeVerification}
                                <td>
                                    {#if row.authenticated}
                                        <button type="button" on:click={() => triggerDisableVerification(row.id)} disabled={loadingAPI || row.username == getUsernameCookie()} class="btn variant-filled-warning">Revoke Verification</button>
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
                                        <button type="button" on:click={() => triggerDisableTOTP(row.id)} disabled={loadingAPI || row.username == getUsernameCookie()} class="btn variant-filled-warning">Revoke TOTP</button>
                                    {:else}
                                        <button type="button" disabled={true} class="btn variant-filled">TOTP Disabled</button>
                                    {/if}
                                </td>
                            {:else}
                                <td>{row.totpEnabled}</td>
                            {/if}

                            <!--Access Privileges-->
                            <td>
                                {#if canChangeAccess}
                                    {#each Object.entries(possiblePrivileges) as [privilege, value]}
                                        <button
                                            class="chip mt-2 mr-2 {hasPrivilege(row.accessAttributes, value) ? 'variant-filled-success' : 'variant-soft'}"
                                            on:click={() => { triggerToggleAccessControl(row.id, value); }}
                                            on:keypress
                                            disabled={loadingAPI || row.username == getUsernameCookie()}
                                        >
                                            <span class="capitalize">{privilege.replace(/_/g, ' ')}</span>
                                        </button>
                                    {/each}
                                {:else}
                                    {#each Object.entries(possiblePrivileges) as [privilege, value]}
                                        <button
                                            class="chip {hasPrivilege(row.accessAttributes, value) ? 'variant-filled-success' : 'variant-soft'}"
                                            on:click={() => { console.debug("TODO!"); }}
                                            disabled={true || row.username == getUsernameCookie()}
                                            on:keypress
                                        >
                                            <span class="capitalize">{privilege.replace(/_/g, ' ')}</span>
                                        </button>
                                    {/each}
                                {/if}
                            </td>
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