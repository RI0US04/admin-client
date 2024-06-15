<script>
    export let value = '';
    export let error = '';
    export let showLoginInstead = false
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
            error = "Email is required";
        } else if (value.length > 256) {
            error = "Your email is too long!"
        } else if (!emailRegex.test(value)) {
            error = "Enter a valid email!"
        } else {
            error = "";
        }
        showLoginInstead = false
    }
</script>

<div class={inputClasses}>
    <input type="email" disabled={disabled} placeholder="sample@outlook.com" bind:value on:input={handleChange} on:blur={handleBlur} />
</div>
{#if error.length !== 0}
    <p class="text-red-500">{error}</p>
{/if}

{#if showLoginInstead}
    <a class="anchor" href="/login">Login Instead?</a>
{/if}