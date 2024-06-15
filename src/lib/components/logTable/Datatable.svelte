<script>
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
	export let data = [];

	import { DataHandler } from '@vincjo/datatables';

	const handler = new DataHandler(data, { rowsPerPage: 5 });
	const rows = handler.getRows();
</script>

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
					<td>{new Date(row.created_at).toDateString()}</td>
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