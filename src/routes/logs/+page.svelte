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
    let logs = [];
    let logTarget = 'user';

    async function requestLogs() {
        const data = await getLogs(logTarget);
        const status = data.status;

        if (status === "SUCCESS") {
            logs = data.logs;
            console.debug("Logs ::", logs)
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

        if (status === "PERMISSION_DENIED") {
            toastStore.trigger({
                message: 'You do not have permission to access this resource!',
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

        requestLogs();
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

	$: handler = new DataHandler(logs, { rowsPerPage: 50 });
	$: rows = handler.getRows();

</script>

<div class="container h-full mx-auto">
	<div class="space-y-10">
        <br>
        <ListBox>
            <ListBoxItem bind:group={logTarget} on:change={requestLogs} name="medium" value="user">User Logs</ListBoxItem>
            <ListBoxItem bind:group={logTarget} on:change={requestLogs} name="medium" value="chat">Chat Logs</ListBoxItem>
            <ListBoxItem bind:group={logTarget} on:change={requestLogs} name="medium" value="admin">Admin Logs</ListBoxItem>
        </ListBox>

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
                        <ThSort {handler} orderBy="content">Content</ThSort>
                        <ThSort {handler} orderBy="severity">Severity</ThSort>
                        <ThSort {handler} orderBy="created_at">Date Time</ThSort>
                    </tr>
                    <tr>
                        <ThFilter {handler} filterBy="id" />
                        <ThFilter {handler} filterBy="content" />
                        <ThFilter {handler} filterBy="severity" />
                        <ThFilter {handler} filterBy="created_at" />
                    </tr>
                </thead>
                <tbody>
                    {#each $rows as row}
                        <tr>
                            <td>{row.id}</td>
                            <td>{row.content}</td>
                            <td>{row.severity}</td>
                            <td>{new Date(row.created_at)}</td>
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