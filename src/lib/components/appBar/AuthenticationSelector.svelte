<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	initializeStores();
	const modalStore = getModalStore();

	import { getContext } from 'svelte';
	import { onMount } from 'svelte';

	let currentRoute = '';

	onMount(() => {
		// Get the first part of the route, to style the buttons properly
		// depending on the current route.
		const { router } = getContext('$$app');
		currentRoute = router.path.split('/')[1];
	});
</script>

<a href="/login">
	<button type="button" class="btn variant-filled-secondary">Login</button>
</a>

<style>
	.btn {
		margin-right: 25px;
	}
</style>
