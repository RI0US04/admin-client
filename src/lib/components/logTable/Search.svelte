<script>
	export let handler;
	let value;
</script>

<input
	class="input sm:w-64 w-36"
	type="search"
	placeholder="Search..."
	bind:value
	on:input={() => handler.search(value)}
/>