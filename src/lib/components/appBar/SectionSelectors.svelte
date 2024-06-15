<script>
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

<style>
    .btn {
        margin-right: 25px;
    }
</style>
  
<button type="button" class="btn {currentRoute === '' ? 'variant-filled' : 'variant-ghost'}">
    Home
</button>
<button type="button" class="btn {currentRoute === 'chat' ? 'variant-filled' : 'variant-ghost'}">
    Chat
</button>
<button type="button" class="btn {currentRoute === 'analytics' ? 'variant-filled' : 'variant-ghost'}">
    Analytics
</button>