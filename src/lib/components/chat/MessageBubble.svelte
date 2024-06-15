<script>
	import { getUsernameCookie } from '$lib/cookies/usernameCookie';
    import { Avatar } from '@skeletonlabs/skeleton';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
    
	const plugins = [gfmPlugin()];
    export let isHost = false
    export let authorName = ""
    export let readableTimestamp = ""
    export let message = ""
</script>


{#if isHost}
    <div class="grid grid-cols-[1fr_auto] gap-2">
        <div class="card p-4 rounded-tr-none space-y-2 variant-soft-primary">
            <header class="flex justify-between items-center">
                <p class="font-bold">{authorName}</p>
                <small class="opacity-50">{readableTimestamp}</small>
            </header>
            <Markdown md={message} plugins={plugins}/>
        </div>
		<Avatar
			initials={getUsernameCookie()}
			border="border-4 border-surface-200-500-token"
		/>
    </div>
{:else}
    <div class="grid grid-cols-[auto_1fr] gap-2">
		<Avatar
			initials={authorName}
			border="border-4 border-surface-200-500-token"
		/>
        <div class="card p-4 variant-soft rounded-tl-none space-y-2">
            <header class="flex justify-between items-center">
                <p class="font-bold">{authorName}</p>
                <small class="opacity-50">{readableTimestamp}</small>
            </header>
            <Markdown md={message} plugins={plugins}/>
        </div>
    </div>
{/if}