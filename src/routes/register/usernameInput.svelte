<script>
    export let value = '';
    export let error = '';
    export let disabled = false

    let inputClasses = 'input-group input-group-divider grid-cols-[1fr_auto]';
    
     $: {
        inputClasses = 'input-group input-group-divider grid-cols-[1fr_auto]' + (error.length ? ' input-warning' : '');
    }

    // @ts-ignore
    function handleChange(event) {
        value = event.target.value;
    }

    function handleBlur() {
        if (!value.trim()) {
            error = "Username is required";
        } else if (value.length < 4) {
            error = "Username is too short! (At least 4 characters)"
        } else if (value.length > 64) {
            error = "Username is too long! (Less than 64 characters)"
        } else {
            error = "";
        }
    }
</script>

<h6 class="h6 mt-3">Username</h6>
<div class={inputClasses}>
    <input type="text" disabled={disabled} placeholder="Enter Username..." bind:value on:input={handleChange} on:blur={handleBlur} />
</div>
{#if error.length !== 0}
    <p class="text-red-500">{error}</p>
{/if}
