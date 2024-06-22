<script>
	import { getSessionCookie, removeSessionCookie } from '$lib/cookies/sessionCookie';
	import { getUsernameCookie, removeUsernameCookie } from '$lib/cookies/usernameCookie';
	import delayedNavigate from '$lib/delayedNavigate';
	import { getTokenCount } from '$lib/services/token/getTokenCount';
	import { Avatar } from '@skeletonlabs/skeleton';

	import { Toast, getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	const toastStore = getToastStore();

	const username = getUsernameCookie();

	onMount(() => {
		const session = getSessionCookie();
	});

	function gotoSettings(){
		delayedNavigate('/settings', 50)
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="horizontal-stack">
	<button type="button" class="btn variant-ghost-surface" on:click={() => delayedNavigate('/home', 50)}>Home Page</button>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<div class="avatar-container" on:click={gotoSettings} tabindex="0">
		<Avatar
			initials={username}
			border="border-4 border-surface-200-500-token hover:!border-primary-400"
			cursor="cursor-pointer"
		/>
	</div>
	<div>
		<h4 class="h4">{username}</h4>
	</div>
</div>

<style>
	.horizontal-stack {
		display: flex;
		align-items: center;
		gap: 1rem; /* Adjust the gap between elements as needed */
	}

	.avatar-container {
		display: flex;
		align-items: center;
	}
</style>
